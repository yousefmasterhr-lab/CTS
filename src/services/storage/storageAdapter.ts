// ====================================================================
// PCMS (Project Correspondence Management System / CTS)
// Decoupled Storage Adapter Interface
// Copyright © 2026 hrsup. All rights reserved.
// ====================================================================

export interface UploadResult {
  file_id: string;
  file_name: string;
  file_size_mb: number;
  storage_direct_url: string;
  mime_type: string;
  upload_timestamp: string;
}

export interface StorageAdapter {
  uploadFile(file: File, docRef: string, category: string): Promise<UploadResult>;
  deleteFile(fileId: string): Promise<boolean>;
  getDownloadUrl(fileId: string): Promise<string>;
}
