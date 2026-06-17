import sharp from "sharp";
import { requireServerEnv } from "@/lib/env";
import { DEFAULT_UPLOAD_OPTIONS, validateUploadedFile } from "@/src/lib/upload-validation";
import { resolveBackgroundColor } from "@/src/lib/background-colors";
import type {
  BackgroundRemovalErrorResponse,
  BackgroundRemovalInput,
  BackgroundRemovalResponse,
  BackgroundRemovalSuccessResponse
} from "@/src/types/background-removal";

const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";
const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_RETRIES = 3;

let recentRequestTimestamps: number[] = [];

class BackgroundRemovalServiceError extends Error {
  code: BackgroundRemovalErrorResponse["error"]["code"];

  constructor(code: BackgroundRemovalErrorResponse["error"]["code"], message: string) {
    super(message);
    this.name = "BackgroundRemovalServiceError";
    this.code = code;
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function enforceInMemoryRateLimit(): void {
  const now = Date.now();
  recentRequestTimestamps = recentRequestTimestamps.filter(
    (timestamp) => now - timestamp < REQUEST_WINDOW_MS
  );

  if (recentRequestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new BackgroundRemovalServiceError(
      "RATE_LIMITED",
      "Too many background removal requests. Please wait a moment and try again."
    );
  }

  recentRequestTimestamps.push(now);
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = (await response.json()) as { errors?: Array<{ title?: string; detail?: string }> };
      const firstError = payload.errors?.[0];

      if (firstError) {
        return firstError.detail ?? firstError.title ?? "Remove.bg request failed.";
      }
    } catch {
      // Fall through to text parsing.
    }
  }

  return response.text();
}

async function callRemoveBgApi(file: Blob, fileName: string): Promise<Buffer> {
  let apiKey: string;

  try {
    apiKey = requireServerEnv("removeBgApiKey").trim();
  } catch {
    throw new BackgroundRemovalServiceError(
      "CONFIGURATION_ERROR",
      "Background removal is not configured. Add REMOVE_BG_API_KEY to .env.local and restart the dev server."
    );
  }

  if (!apiKey || apiKey.includes("your_remove_bg_api_key_here")) {
    throw new BackgroundRemovalServiceError(
      "CONFIGURATION_ERROR",
      "Background removal is using a placeholder API key. Add a real Remove.bg API key to .env.local."
    );
  }

  const formData = new FormData();
  formData.set("image_file", file, fileName);
  formData.set("size", "auto");
  formData.set("format", "png");

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(REMOVE_BG_ENDPOINT, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey
      },
      body: formData
    });

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }

    const errorMessage = await readErrorMessage(response);

    if (!isRetryableStatus(response.status) || attempt === MAX_RETRIES) {
      throw new BackgroundRemovalServiceError(
        "BACKGROUND_REMOVAL_FAILED",
        `Remove.bg request failed (${response.status}): ${errorMessage}`
      );
    }

    lastError = new Error(errorMessage);
    await delay(250 * attempt);
  }

  throw lastError ?? new Error("Remove.bg request failed unexpectedly.");
}

async function compositeBackground(imageBuffer: Buffer, requirement: BackgroundRemovalInput["template"]["background"]): Promise<Buffer> {
  const background = resolveBackgroundColor(requirement);

  return sharp(imageBuffer)
    .flatten({ background: background.hex })
    .png()
    .toBuffer();
}

export async function removeBackground(input: BackgroundRemovalInput): Promise<BackgroundRemovalResponse> {
  const validation = validateUploadedFile(
    input.imageBuffer,
    input.mimeType,
    DEFAULT_UPLOAD_OPTIONS
  );

  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: validation.errors.some((error) => error.includes("size"))
          ? "FILE_TOO_LARGE"
          : "INVALID_FILE_TYPE",
        message: validation.errors[0] ?? "Invalid upload."
      }
    };
  }

  if (!input.template.id) {
    return {
      success: false,
      error: {
        code: "TEMPLATE_NOT_FOUND",
        message: "Template not found."
      }
    };
  }

  const startedAt = Date.now();

  try {
    enforceInMemoryRateLimit();

    const removeBgOutput = await callRemoveBgApi(
      new Blob([new Uint8Array(input.imageBuffer)], { type: input.mimeType }),
      input.fileName
    );
    const flattenedOutput = await compositeBackground(removeBgOutput, input.template.background);

    const response: BackgroundRemovalSuccessResponse = {
      success: true,
      provider: "remove-bg",
      image: {
        mimeType: "image/png",
        base64: flattenedOutput.toString("base64")
      },
      durationMs: Date.now() - startedAt
    };

    return response;
  } catch (error) {
    if (error instanceof BackgroundRemovalServiceError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Background removal failed."
      }
    };
  }
}

export function getBackgroundRemovalThresholds(): {
  requestWindowMs: number;
  maxRequestsPerWindow: number;
} {
  return {
    requestWindowMs: REQUEST_WINDOW_MS,
    maxRequestsPerWindow: MAX_REQUESTS_PER_WINDOW
  };
}
