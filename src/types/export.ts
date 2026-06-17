export type ExportFormat = "jpeg" | "png" | "pdf";

export interface ExportResult {
  jpeg?: string; // data URL
  png?: string; // data URL
  pdf?: string; // data URL
}

export interface ProcessedPhotoResult {
  templateId: string;
  fileName: string;
  sourceWidth: number;
  sourceHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  exports: ExportResult;
  complianceScore: number;
  compliant: boolean;
  exportedAt: string;
}
