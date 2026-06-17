export type ComplianceSeverity = "info" | "warning" | "error";

export interface ComplianceCheckResult {
  id: string;
  label: string;
  passed: boolean;
  severity: ComplianceSeverity;
  expected?: string | number;
  actual?: string | number;
  message?: string;
}

export interface ComplianceResult {
  templateId: string;
  compliant: boolean;
  score: number; // 0-100
  checks: ComplianceCheckResult[];
  issues: string[]; // User-facing error messages
  warnings: string[]; // User-facing warnings
  evaluatedAt: string;
}

export interface ImageAnalysis {
  brightness: number; // 0-255 average
  sharpness: number; // 0-100 (estimated from edge detection)
  contrast: number; // 0-100
  backgroundUniformity: number; // 0-100, higher = more uniform plain background
  eyeRegionBrightness: number; // 0-255 average in eye regions
  faceRegionBrightness: number; // 0-255 average in face region
  eyesVisible: boolean;
  sunglassesLikely: boolean;
}

export interface FaceHeadPose {
  yaw: number; // degrees, -90 to 90
  pitch: number; // degrees, -90 to 90
  roll: number; // degrees, -90 to 90
}
