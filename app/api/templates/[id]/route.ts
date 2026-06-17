import { NextResponse } from "next/server";
import { getTemplateById } from "@/src/services/template-engine";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    return NextResponse.json(
      { error: "Template not found", id },
      {
        status: 404
      }
    );
  }

  return NextResponse.json({ template });
}