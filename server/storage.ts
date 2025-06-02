import { uploads, googleDocsSettings, type Upload, type InsertUpload, type GoogleDocsSettings, type InsertGoogleDocsSettings } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private uploads: Map<number, Upload>;
  private googleDocsSettings: Map<string, GoogleDocsSettings>;
  private currentUploadId: number;
  private currentSettingsId: number;

  constructor() {
    this.uploads = new Map();
    this.googleDocsSettings = new Map();
    this.currentUploadId = 1;
    this.currentSettingsId = 1;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentUploadId++;
    const upload: Upload = {
      ...insertUpload,
      id,
      createdAt: new Date(),
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async getAllUploads(): Promise<Upload[]> {
    return Array.from(this.uploads.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateUpload(id: number, updates: Partial<Upload>): Promise<Upload | undefined> {
    const existing = this.uploads.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.uploads.set(id, updated);
    return updated;
  }

  async deleteUpload(id: number): Promise<boolean> {
    return this.uploads.delete(id);
  }

  async createGoogleDocsSettings(insertSettings: InsertGoogleDocsSettings): Promise<GoogleDocsSettings> {
    const id = this.currentSettingsId++;
    const settings: GoogleDocsSettings = {
      ...insertSettings,
      id,
      createdAt: new Date(),
    };
    this.googleDocsSettings.set(insertSettings.userId, settings);
    return settings;
  }

  async getGoogleDocsSettings(userId: string): Promise<GoogleDocsSettings | undefined> {
    return this.googleDocsSettings.get(userId);
  }

  async updateGoogleDocsSettings(userId: string, updates: Partial<GoogleDocsSettings>): Promise<GoogleDocsSettings | undefined> {
    const existing = this.googleDocsSettings.get(userId);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.googleDocsSettings.set(userId, updated);
    return updated;
  }

  async deleteGoogleDocsSettings(userId: string): Promise<boolean> {
    return this.googleDocsSettings.delete(userId);
  }
}

export const storage = new MemStorage();
