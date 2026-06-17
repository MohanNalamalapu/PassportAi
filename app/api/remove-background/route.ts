import { NextRequest, NextResponse } from "next/server";
import { getTemplateById } from "@/src/services/template-engine";
import { removeBackground } from "@/src/services/background-removal";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const templateId = formData.get("templateId");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: 'Expected multipart field "image" to contain a JPEG or PNG file.'
          }
        },
        { status: 400 }
      );
    }

    if (typeof templateId !== "string" || !templateId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TEMPLATE_NOT_FOUND",
            message: 'Expected multipart field "templateId" to contain a valid template id.'
          }
        },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TEMPLATE_NOT_FOUND",
            message: `Unknown template id: ${templateId}`
          }
        },
        { status: 404 }
      );
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const result = await removeBackground({
      imageBuffer,
      fileName: image.name || "upload",
      mimeType: image.type || "application/octet-stream",
      template
    });

    if (!result.success) {
      const statusCode =
        result.error.code === "RATE_LIMITED"
          ? 429
          : result.error.code === "CONFIGURATION_ERROR"
            ? 503
            : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Remove.bg route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "Unexpected failure while removing the background."
        }
      },
      { status: 500 }
    );
  }
}
