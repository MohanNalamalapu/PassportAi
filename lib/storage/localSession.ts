import type { DocumentTemplate } from "@/lib/templates/schema";

const selectedTemplateKey = "passportai:selected-template";

export function readSelectedTemplateId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(selectedTemplateKey);
}

export function persistSelectedTemplate(template: DocumentTemplate): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(selectedTemplateKey, template.id);
}

export function clearSelectedTemplate(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(selectedTemplateKey);
}

