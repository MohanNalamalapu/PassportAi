import type { AllowedImageMimeType, UploadValidationOptions, UploadValidationResult } from "@/src/types/upload";

/**
 * Default upload validation settings.
 * Phase 1: Strict validation to prevent issues downstream.
 */
export const DEFAULT_UPLOAD_OPTIONS: UploadValidationOptions = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["image/jpeg", "image/png"]
};

/**
 * Validate file MIME type against allowed types.
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: AllowedImageMimeType[]
): mimeType is AllowedImageMimeType {
  return allowedTypes.includes(mimeType as AllowedImageMimeType);
}

/**
 * Validate file size against maximum allowed.
 */
export function validateFileSize(sizeBytes: number, maxSizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= maxSizeBytes;
}

/**
 * Detect image file type from magic bytes (file signature).
 * Prevents disguised files and corrupted headers.
 *
 * Signatures:
 * JPEG: FF D8 FF
 * PNG: 89 50 4E 47
 */
export function detectImageType(buffer: Buffer): AllowedImageMimeType | null {
  if (buffer.length < 4) {
    return null;
  }

  const hex = buffer.subarray(0, 4).toString("hex").toUpperCase();

  if (hex.startsWith("FFD8FF")) {
    return "image/jpeg";
  }

  if (hex.startsWith("89504E47")) {
    return "image/png";
  }

  return null;
}

/**
 * Comprehensive file validation:
 * 1. MIME type check
 * 2. File size check
 * 3. Magic byte detection (corruption detection)
 * 4. Consistency between declared and detected types
 */
export function validateUploadedFile(
  buffer: Buffer,
  declaredMimeType: string,
  options: UploadValidationOptions = DEFAULT_UPLOAD_OPTIONS
): UploadValidationResult {
  const errors: string[] = [];

  // Check declared MIME type
  if (!validateMimeType(declaredMimeType, options.allowedMimeTypes)) {
    errors.push(
      `Invalid MIME type. Allowed: ${options.allowedMimeTypes.join(", ")}. Got: ${declaredMimeType}`
    );
  }

  // Check file size
  if (!validateFileSize(buffer.length, options.maxSizeBytes)) {
    errors.push(
      `File size exceeds limit. Max: ${Math.round(options.maxSizeBytes / 1024 / 1024)}MB. Got: ${Math.round(buffer.length / 1024 / 1024)}MB`
    );
  }

  // Detect actual file type from magic bytes
  const detectedType = detectImageType(buffer);

  if (!detectedType) {
    errors.push(
      "File header is corrupted or unrecognized. Ensure the file is a valid JPEG or PNG."
    );
  }

  // Verify consistency between declared and detected type
  if (detectedType && declaredMimeType !== detectedType) {
    errors.push(
      `File type mismatch. Declared: ${declaredMimeType}, Detected: ${detectedType}. Ensure you're uploading the correct file format.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    mimeType: detectedType || (validateMimeType(declaredMimeType, options.allowedMimeTypes) ? (declaredMimeType as AllowedImageMimeType) : undefined),
    sizeBytes: buffer.length
  };
}
