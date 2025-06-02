import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'image' | 'audio' | 'document'
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  processed: boolean("processed").default(false),
  aiAnalysis: text("ai_analysis"),
  transcription: text("transcription"),
  uploadedToGoogleDocs: boolean("uploaded_to_google_docs").default(false),
  googleDocsUrl: text("google_docs_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
});

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

export const googleDocsSettings = pgTable("google_docs_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  documentId: text("document_id"),
  documentTitle: text("document_title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoogleDocsSettingsSchema = createInsertSchema(googleDocsSettings).omit({
  id: true,
  createdAt: true,
});

export type InsertGoogleDocsSettings = z.infer<typeof insertGoogleDocsSettingsSchema>;
export type GoogleDocsSettings = typeof googleDocsSettings.$inferSelect;
