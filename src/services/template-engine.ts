import { passportTemplateSeed } from "@/src/data/passport-templates";
import { validateTemplateCatalog } from "@/src/lib/template-validation";
import type { DocumentTemplate, TemplateOption } from "@/src/types/passport";

/**
 * Phase 1 template engine.
 * This module owns the canonical, validated template catalog and exposes read-only accessors
 * that the API layer and UI can share without duplicating parsing logic.
 */
const templateCatalog = Object.freeze(validateTemplateCatalog(passportTemplateSeed));

function sortTemplates(values: readonly DocumentTemplate[]): DocumentTemplate[] {
  return [...values].sort((left, right) => {
    const country = left.country.localeCompare(right.country);
    return country === 0 ? left.document.localeCompare(right.document) : country;
  });
}

export function getTemplates(): DocumentTemplate[] {
  return sortTemplates(templateCatalog);
}

export const getAllTemplates = getTemplates;

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return templateCatalog.find((template) => template.id === id);
}

export function getDefaultTemplate(): DocumentTemplate {
  return getTemplateById("india_passport") ?? getTemplates()[0];
}

export function getCountries(): string[] {
  return Array.from(new Set(templateCatalog.map((template) => template.country))).sort();
}

export function getTemplatesByCountry(country: string): DocumentTemplate[] {
  return templateCatalog.filter((template) => template.country === country);
}

export function searchTemplates(query: string): DocumentTemplate[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return getTemplates();
  }

  return getTemplates().filter((template) => {
    const searchable = `${template.country} ${template.document} ${template.id}`.toLowerCase();
    return searchable.includes(normalizedQuery);
  });
}

export function toTemplateOptions(values: DocumentTemplate[] = getTemplates()): TemplateOption[] {
  return values.map((template) => ({
    id: template.id,
    label: `${template.country} ${template.document}`,
    country: template.country,
    document: template.document,
    size: formatTemplateSize(template)
  }));
}

export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function getTemplatePixelSize(template: DocumentTemplate): {
  widthPx: number;
  heightPx: number;
} {
  return {
    widthPx: mmToPixels(template.width_mm, template.dpi),
    heightPx: mmToPixels(template.height_mm, template.dpi)
  };
}

export function formatTemplateSize(template: DocumentTemplate): string {
  return `${template.width_mm} x ${template.height_mm} mm`;
}

export function formatBackground(background: DocumentTemplate["background"]): string {
  return background
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}