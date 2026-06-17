import type { BackgroundRequirement, DocumentTemplate } from "@/src/types/passport";

export type RemoveBgProvider = "remove-bg";

export interface BackgroundRemovalInput {
  imageBuffer: Buffer;
  fileName: string;
  mimeType: string;
  template: DocumentTemplate;
}

export interface BackgroundRemovalImageResponse {
  mimeType: "image/png";
  base64: string;
  widthPx?: number;
  heightPx?: number;
}

export interface BackgroundRemovalSuccessResponse {
  success: true;
  provider: RemoveBgProvider;
  image: BackgroundRemovalImageResponse;
  durationMs: number;
}

export interface BackgroundRemovalErrorPayload {
  code:
    | "INVALID_FILE_TYPE"
    | "FILE_TOO_LARGE"
    | "TEMPLATE_NOT_FOUND"
    | "CONFIGURATION_ERROR"
    | "BACKGROUND_REMOVAL_FAILED"
    | "RATE_LIMITED"
    | "UNKNOWN_ERROR";
  message: string;
}

export interface BackgroundRemovalErrorResponse {
  success: false;
  error: BackgroundRemovalErrorPayload;
}

export type BackgroundRemovalResponse =
  | BackgroundRemovalSuccessResponse
  | BackgroundRemovalErrorResponse;

export interface TemplateBackgroundColor {
  requirement: BackgroundRequirement;
  hex: string;
  label: string;
}
