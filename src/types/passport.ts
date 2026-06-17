/**
 * Shared backend contracts for PassportAI.
 * These types are intentionally wider than Phase 1 so the template engine can
 * stay compatible with the future background-removal, crop, compliance, and export stages.
 */

export type BackgroundRequirement =
  | "white"
  | "off_white"
  | "light_gray"
  | "blue"
  | `#${string}`;

export interface DocumentTemplate {
  id: string;
  country: string;
  document: string;
  width_mm: number;
  height_mm: number;
  background: BackgroundRequirement;
  dpi: number;
  head_ratio_min: number;
  head_ratio_max: number;
  face_center_tolerance: number;
  min_width_px: number;
  min_height_px: number;
  brightness_min?: number;
  brightness_max?: number;
  sharpness_min?: number;
  max_yaw?: number;
  max_pitch?: number;
  max_roll?: number;
}

export interface TemplateOption {
  id: string;
  label: string;
  country: string;
  document: string;
  size: string;
}

export interface ComplianceCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  expected?: string;
  actual?: string;
  message?: string;
}

export interface ComplianceResult {
  templateId: string;
  compliant: boolean;
  score: number;
  checks: ComplianceCheck[];
  issues: string[];
  evaluatedAt: string;
}

export interface ProcessedPhoto {
  templateId: string;
  source: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    widthPx: number;
    heightPx: number;
  };
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputs: {
    jpeg?: string;
    png?: string;
    pdf?: string;
  };
  compliance: ComplianceResult;
  processedAt: string;
}