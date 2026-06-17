import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  validateUploadedFile,
  DEFAULT_UPLOAD_OPTIONS
} from "@/src/lib/upload-validation";
import type {
  UploadValidationOptions,
  UploadedImageMetadata,
  UploadResponse
} from "@/src/types/upload";

/**
 * Phase 1 Upload Engine.
 *
 * Responsibilities:
 * 1. Validate uploaded files (type, size, corruption)
 * 2. Store files temporarily in the filesystem
 * 3. Generate unique file IDs for tracking
 * 4. Return metadata for downstream processing
 *
 * Storage Strategy:
 * - Files stored in system temp directory (OS-managed cleanup)
 * - Each file gets a UUID for secure referencing
 * - Files are prefixed with "passportai-" for easy identification
 * - Full path stored in metadata for retrieval by other services
 *
 * Future: Replace with cloud storage (S3, GCS) after Phase 7
 */

const TEMP_DIR = path.join(process.cwd(), ".tmp", "uploads");
const FILE_PREFIX = "passportai-";

/**
 * Ensure temporary upload directory exists.
 * Called once on service initialization.
 */
async function ensureTempDir(): Promise<void> {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EEXIST") {
      throw new Error(`Failed to create temp directory: ${error}`);
    }
  }
}

/**
 * Generate a unique file ID for tracking.
 * Format: "file_" + UUID for easy identification in logs.
 */
function generateFileId(): string {
  return `file_${randomUUID()}`;
}

/**
 * Save validated buffer to temporary storage.
 * Returns full file path for retrieval.
 */
async function saveUploadedFile(fileId: string, buffer: Buffer): Promise<string> {
  await ensureTempDir();

  const fileName = `${FILE_PREFIX}${fileId}.bin`;
  const filePath = path.join(TEMP_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  return filePath;
}

/**
 * Delete uploaded file when no longer needed.
 * Called by downstream services after processing.
 */
export async function deleteUploadedFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Failed to delete file ${filePath}:`, error);
  }
}

/**
 * Retrieve uploaded file content by path.
 * Used by background removal, face detection, and export services.
 */
export async function getUploadedFileContent(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

/**
 * Main upload handler.
 *
 * Workflow:
 * 1. Validate file (MIME type, size, corruption)
 * 2. Generate unique file ID
 * 3. Save to temporary storage
 * 4. Return metadata for tracking
 *
 * Returns structured response for API endpoint.
 */
export async function uploadImage(
  buffer: Buffer,
  originalFileName: string,
  declaredMimeType: string,
  options: UploadValidationOptions = DEFAULT_UPLOAD_OPTIONS
): Promise<UploadResponse> {
  // Validate uploaded file
  const validation = validateUploadedFile(buffer, declaredMimeType, options);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0] // Return first error for clarity
    };
  }

  if (!validation.mimeType) {
    return {
      success: false,
      error: "Unable to determine file type. Upload a valid JPEG or PNG."
    };
  }

  // Generate unique file ID
  const fileId = generateFileId();

  // Save file to temporary storage
  let tempFilePath: string;

  try {
    tempFilePath = await saveUploadedFile(fileId, buffer);
  } catch (error) {
    return {
      success: false,
      error: `Failed to save file: ${error}`
    };
  }

  // Create metadata for downstream services
  const metadata: UploadedImageMetadata = {
    fileId,
    fileName: originalFileName,
    mimeType: validation.mimeType,
    sizeBytes: validation.sizeBytes || buffer.length,
    uploadedAt: new Date().toISOString(),
    tempFilePath
  };

  // Return success response with file ID and temporary URL for preview
  return {
    success: true,
    fileId,
    imageUrl: `/api/upload/${fileId}`, // Endpoint for retrieving the uploaded file
    metadata
  };
}

/**
 * Retrieve file metadata by file ID.
 * Used by subsequent API endpoints to access uploaded files.
 *
 * Returns null if file not found or metadata cannot be recovered.
 * In Phase 2 (no database), we reconstruct metadata from filesystem.
 */
export async function getUploadedFileMetadata(fileId: string): Promise<UploadedImageMetadata | null> {
  const fileName = `${FILE_PREFIX}${fileId}.bin`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    const stats = await fs.stat(filePath);

    return {
      fileId,
      fileName: fileId,
      mimeType: "image/jpeg", // In Phase 2, we don't store MIME info. Will improve in Phase 3+
      sizeBytes: stats.size,
      uploadedAt: stats.birthtime.toISOString(),
      tempFilePath: filePath
    };
  } catch {
    return null;
  }
}
