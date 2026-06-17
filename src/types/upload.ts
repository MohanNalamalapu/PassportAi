/**
 * Upload request and response contracts.
 * These types ensure type safety across the upload pipeline.
 */

export type AllowedImageMimeType = "image/jpeg" | "image/png";

export interface UploadValidationOptions {
  maxSizeBytes: number;
  allowedMimeTypes: AllowedImageMimeType[];
}

export interface UploadValidationResult {
  valid: boolean;
  errors: string[];
  mimeType?: AllowedImageMimeType;
  sizeBytes?: number;
}

export interface UploadedImageMetadata {
  fileId: string;
  fileName: string;
  mimeType: AllowedImageMimeType;
  sizeBytes: number;
  uploadedAt: string;
  tempFilePath: string;
}

export interface UploadResponse {
  success: boolean;
  fileId?: string;
  imageUrl?: string;
  metadata?: UploadedImageMetadata;
  error?: string;
}

export interface UploadApiRequest {
  file: File;
}
