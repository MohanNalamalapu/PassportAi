// Re-export upload types for frontend compatibility
export type {
  AllowedImageMimeType,
  UploadValidationOptions,
  UploadValidationResult,
  UploadedImageMetadata,
  UploadResponse,
  UploadApiRequest
} from "@/src/types/upload";

// Re-export validation utilities
export {
  DEFAULT_UPLOAD_OPTIONS,
  validateMimeType,
  validateFileSize,
  detectImageType,
  validateUploadedFile
} from "@/src/lib/upload-validation";

// Re-export upload service (for potential frontend-to-backend communication)
export {
  deleteUploadedFile,
  getUploadedFileContent,
  getUploadedFileMetadata
} from "@/src/services/upload-engine";
