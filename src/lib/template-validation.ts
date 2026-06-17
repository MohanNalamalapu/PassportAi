import type { DocumentTemplate } from "@/src/types/passport";

const requiredStringFields = ["id", "country", "document", "background"] as const;
const requiredNumberFields = [
  "width_mm",
  "height_mm",
  "dpi",
  "head_ratio_min",
  "head_ratio_max",
  "face_center_tolerance",
  "min_width_px",
  "min_height_px"
] as const;

export function isDocumentTemplate(value: unknown): value is DocumentTemplate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    requiredStringFields.every((field) => typeof item[field] === "string") &&
    requiredNumberFields.every((field) => typeof item[field] === "number") &&
    Number(item.width_mm) > 0 &&
    Number(item.height_mm) > 0 &&
    Number(item.dpi) >= 72 &&
    Number(item.head_ratio_min) > 0 &&
    Number(item.head_ratio_max) >= Number(item.head_ratio_min)
  );
}

export function validateTemplateCatalog(values: unknown): DocumentTemplate[] {
  if (!Array.isArray(values)) {
    throw new Error("Passport templates must be an array.");
  }

  const templates = values.filter(isDocumentTemplate);

  if (templates.length !== values.length) {
    throw new Error("One or more passport templates are invalid.");
  }

  const ids = new Set<string>();

  for (const template of templates) {
    if (ids.has(template.id)) {
      throw new Error(`Duplicate passport template id: ${template.id}`);
    }

    ids.add(template.id);
  }

  return templates;
}