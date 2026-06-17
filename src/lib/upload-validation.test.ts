import { describe, expect, it } from "vitest";
import {
  detectImageType,
  validateFileSize,
  validateMimeType,
  validateUploadedFile
} from "@/src/lib/upload-validation";

describe("upload-validation", () => {
  it("validates allowed MIME types", () => {
    expect(validateMimeType("image/jpeg", ["image/jpeg", "image/png"])).toBe(true);
    expect(validateMimeType("image/gif", ["image/jpeg", "image/png"])).toBe(false);
  });

  it("validates file size bounds", () => {
    expect(validateFileSize(1024, 2048)).toBe(true);
    expect(validateFileSize(0, 2048)).toBe(false);
    expect(validateFileSize(4096, 2048)).toBe(false);
  });

  it("detects JPEG and PNG magic bytes", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const invalid = Buffer.from([0x00, 0x00, 0x00, 0x00]);

    expect(detectImageType(jpeg)).toBe("image/jpeg");
    expect(detectImageType(png)).toBe("image/png");
    expect(detectImageType(invalid)).toBeNull();
  });

  it("rejects mismatched declared and detected MIME types", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const result = validateUploadedFile(png, "image/jpeg");

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("mismatch"))).toBe(true);
  });
});
