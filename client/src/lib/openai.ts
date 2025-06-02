// This file contains OpenAI API integration utilities
// Note: API calls are handled on the server side for security

export interface ImageAnalysisResult {
  analysis: string;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  duration: number;
}

// These functions would be used if we were making direct API calls from the frontend
// Currently, all OpenAI API calls are handled on the server side

export const analyzeImageOnServer = async (uploadId: number): Promise<ImageAnalysisResult> => {
  const response = await fetch(`/api/uploads/${uploadId}/analyze`, {
    method: "POST",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }
  
  return response.json();
};

export const transcribeAudioOnServer = async (uploadId: number): Promise<TranscriptionResult> => {
  const response = await fetch(`/api/uploads/${uploadId}/transcribe`, {
    method: "POST",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to transcribe audio");
  }
  
  return response.json();
};
