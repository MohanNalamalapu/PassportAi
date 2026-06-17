import type { ComplianceResult } from "@/src/types/compliance";
import type { ExportResult } from "@/src/types/export";

const processingResultsKey = "passportai:processing-results";

export interface ProcessingSession {
  templateId: string;
  country: string;
  document: string;
  previewDataUrl: string;
  exportResult: ExportResult;
  complianceResult: ComplianceResult;
  backgroundRemoved: boolean;
  sourceWidth: number;
  sourceHeight: number;
  processedAt: string;
}

export function persistProcessingResults(results: ProcessingSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(processingResultsKey, JSON.stringify(results));
}

export function readProcessingResults(): ProcessingSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(processingResultsKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ProcessingSession;
  } catch {
    return null;
  }
}

export function clearProcessingResults(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(processingResultsKey);
}
