import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/src/services/upload-engine";

/**
 * POST /api/upload
 *
 * Upload a passport photo for processing.
 *
 * Request:
 * - Multipart form data with "file" field
 * - JPEG or PNG only
 * - Max 10MB
 *
 * Response:
 * {
 *   success: true,
 *   fileId: "file_<uuid>",
 *   imageUrl: "/api/upload/file_<uuid>",
 *   metadata: { ... }
 * }
 *
 * Errors:
 * - 400: Invalid file format, size, or corrupted
 * - 500: Server error during upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // Validate form data structure
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing "file" field in form data'
        },
        { status: 400 }
      );
    }

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Delegate to upload service
    const response = await uploadImage(buffer, file.name, file.type);

    // Return appropriate status code
    if (!response.success) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during upload"
      },
      { status: 500 }
    );
  }
}

