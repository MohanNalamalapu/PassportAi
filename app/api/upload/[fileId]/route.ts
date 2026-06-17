import { NextRequest, NextResponse } from "next/server";
import { getUploadedFileMetadata, getUploadedFileContent } from "@/src/services/upload-engine";

type RouteContext = {
  params: Promise<{
    fileId: string;
  }>;
};

/**
 * GET /api/upload/[fileId]
 *
 * Retrieve uploaded file content.
 *
 * Response:
 * - Image binary (JPEG or PNG) with appropriate Content-Type header
 *
 * Errors:
 * - 400: Invalid file ID format
 * - 404: File not found
 * - 500: Server error during retrieval
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { fileId } = await params;

    // Validate file ID format
    if (!fileId || typeof fileId !== "string" || !fileId.startsWith("file_")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file ID format"
        },
        { status: 400 }
      );
    }

    // Retrieve file metadata
    const metadata = await getUploadedFileMetadata(fileId);

    if (!metadata) {
      return NextResponse.json(
        {
          success: false,
          error: "Uploaded file not found or has expired"
        },
        { status: 404 }
      );
    }

    // Retrieve file content
    const fileContent = await getUploadedFileContent(metadata.tempFilePath);

    // Return file with appropriate content type
    const blob = new Blob([new Uint8Array(fileContent)], { type: metadata.mimeType });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": metadata.mimeType,
        "Content-Length": fileContent.length.toString(),
        "Cache-Control": "private, max-age=3600" // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error("File retrieval error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during file retrieval"
      },
      { status: 500 }
    );
  }
}
