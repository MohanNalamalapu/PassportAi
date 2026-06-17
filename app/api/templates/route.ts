import { NextResponse } from "next/server";
import { getTemplates } from "@/src/services/template-engine";

export function GET() {
  return NextResponse.json({
    templates: getTemplates()
  });
}

