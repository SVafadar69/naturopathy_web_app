import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUploadSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";

// Define the multer request interface
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all uploads
  app.get("/api/uploads", async (req, res) => {
    try {
      const uploads = await storage.getAllUploads();
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uploads" });
    }
  });

  // Get single upload
  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }
      res.json(upload);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upload" });
    }
  });

  // Upload file
  app.post("/api/uploads", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { type } = req.body;
      if (!type || !["image", "audio", "document"].includes(type)) {
        return res.status(400).json({ error: "Invalid file type" });
      }

      const uploadData = {
        type,
        originalName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        processed: false,
        aiAnalysis: null,
        transcription: null,
        uploadedToGoogleDocs: false,
        googleDocsUrl: null,
      };

      const newUpload = await storage.createUpload(uploadData);

      // Process the file asynchronously
      processFileAsync(newUpload);

      res.json(newUpload);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Process image with AI
  app.post("/api/uploads/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      if (upload.type !== "image") {
        return res.status(400).json({ error: "Only images can be analyzed" });
      }

      // Read the image file
      const imageBuffer = fs.readFileSync(upload.filePath);
      const base64Image = imageBuffer.toString("base64");

      // Analyze with GPT-4 Vision
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail. Extract any text content, describe key visual elements, charts, graphs, or important information. Provide a comprehensive analysis that would be useful for documentation purposes.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${upload.mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const analysis = response.choices[0].message.content;

      // Update the upload with analysis
      const updatedUpload = await storage.updateUpload(id, {
        aiAnalysis: analysis,
        processed: true,
      });

      res.json(updatedUpload);
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  // Transcribe audio
  app.post("/api/uploads/:id/transcribe", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      if (upload.type !== "audio") {
        return res.status(400).json({ error: "Only audio files can be transcribed" });
      }

      // Create a read stream for the audio file
      const audioStream = fs.createReadStream(upload.filePath);

      // Transcribe with Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
      });

      // Update the upload with transcription
      const updatedUpload = await storage.updateUpload(id, {
        transcription: transcription.text,
        processed: true,
      });

      res.json(updatedUpload);
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });

  // Upload to Google Docs
  app.post("/api/uploads/:id/upload-to-docs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      if (!upload.processed) {
        return res.status(400).json({ error: "File must be processed first" });
      }

      // Mock Google Docs upload for now - in production, implement OAuth flow
      const documentUrl = `https://docs.google.com/document/d/mock-${upload.id}`;
      
      const updatedUpload = await storage.updateUpload(id, {
        uploadedToGoogleDocs: true,
        googleDocsUrl: documentUrl,
      });

      res.json({ success: true, documentUrl, upload: updatedUpload });
    } catch (error) {
      console.error("Google Docs upload error:", error);
      res.status(500).json({ error: "Failed to upload to Google Docs" });
    }
  });

  // Delete upload
  app.delete("/api/uploads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getUpload(id);
      
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      // Delete the file from disk
      if (fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }

      // Delete from storage
      const deleted = await storage.deleteUpload(id);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete upload" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete upload" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async file processing function
async function processFileAsync(upload: any) {
  try {
    if (upload.type === "image") {
      // Auto-analyze images
      const imageBuffer = fs.readFileSync(upload.filePath);
      const base64Image = imageBuffer.toString("base64");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail. Extract any text content, describe key visual elements, charts, graphs, or important information. Provide a comprehensive analysis that would be useful for documentation purposes.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${upload.mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      await storage.updateUpload(upload.id, {
        aiAnalysis: response.choices[0].message.content,
        processed: true,
      });
    } else if (upload.type === "audio") {
      // Auto-transcribe audio
      const audioStream = fs.createReadStream(upload.filePath);

      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
      });

      await storage.updateUpload(upload.id, {
        transcription: transcription.text,
        processed: true,
      });
    }
  } catch (error) {
    console.error("Async processing error:", error);
  }
}
