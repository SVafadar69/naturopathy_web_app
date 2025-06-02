import { uploads, googleDocsSettings, type Upload, type InsertUpload, type GoogleDocsSettings, type InsertGoogleDocsSettings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  getAllUploads(): Promise<Upload[]>;
  updateUpload(id: number, updates: Partial<Upload>): Promise<Upload | undefined>;
  deleteUpload(id: number): Promise<boolean>;

  // Google Docs settings operations
  createGoogleDocsSettings(settings: InsertGoogleDocsSettings): Promise<GoogleDocsSettings>;
  getGoogleDocsSettings(userId: string): Promise<GoogleDocsSettings | undefined>;
  updateGoogleDocsSettings(userId: string, updates: Partial<GoogleDocsSettings>): Promise<GoogleDocsSettings | undefined>;
  deleteGoogleDocsSettings(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async getAllUploads(): Promise<Upload[]> {
    const allUploads = await db.select().from(uploads).orderBy(uploads.createdAt);
    return allUploads.reverse(); // Most recent first
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db
      .insert(uploads)
      .values(insertUpload)
      .returning();
    return upload;
  }

  async updateUpload(id: number, updates: Partial<Upload>): Promise<Upload | undefined> {
    const [upload] = await db
      .update(uploads)
      .set(updates)
      .where(eq(uploads.id, id))
      .returning();
    return upload || undefined;
  }

  async deleteUpload(id: number): Promise<boolean> {
    const result = await db.delete(uploads).where(eq(uploads.id, id));
    return result.rowCount > 0;
  }

  async createGoogleDocsSettings(insertSettings: InsertGoogleDocsSettings): Promise<GoogleDocsSettings> {
    const [settings] = await db
      .insert(googleDocsSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async getGoogleDocsSettings(userId: string): Promise<GoogleDocsSettings | undefined> {
    const [settings] = await db.select().from(googleDocsSettings).where(eq(googleDocsSettings.userId, userId));
    return settings || undefined;
  }

  async updateGoogleDocsSettings(userId: string, updates: Partial<GoogleDocsSettings>): Promise<GoogleDocsSettings | undefined> {
    const [settings] = await db
      .update(googleDocsSettings)
      .set(updates)
      .where(eq(googleDocsSettings.userId, userId))
      .returning();
    return settings || undefined;
  }

  async deleteGoogleDocsSettings(userId: string): Promise<boolean> {
    const result = await db.delete(googleDocsSettings).where(eq(googleDocsSettings.userId, userId));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
