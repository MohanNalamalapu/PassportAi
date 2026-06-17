import type { DocumentTemplate } from "@/src/types/passport";
import type { ImagePoint } from "@/src/types/face";

export interface PassportCropInput {
  template: DocumentTemplate;
  sourceWidth: number;
  sourceHeight: number;
  faceBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  leftEye: ImagePoint;
  rightEye: ImagePoint;
  noseTip: ImagePoint;
  chin: ImagePoint;
  forehead?: ImagePoint;
}

export interface PassportFramingMetrics {
  crownMarginRatio: number;
  chinToBottomRatio: number;
  eyeLineFromTopRatio: number;
}

export interface PassportCropOutput {
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputWidth: number;
  outputHeight: number;
  headRatio: number;
  centered: boolean;
  targetHeadHeight: number;
  framing: PassportFramingMetrics;
}

/** Padding relative to measured head height — matches professional booth tools. */
const FRAMING = {
  topPaddingFactor: 0.24,
  bottomPaddingFactor: 0.70,
  hairExtensionFactor: 0.8
} as const;

export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function estimateCrownY(forehead: ImagePoint | undefined, noseTip: ImagePoint, chin: ImagePoint): number {
  const noseToChin = Math.max(chin.y - noseTip.y, 1);
  const foreheadY = forehead?.y ?? noseTip.y - noseToChin * 1.05;
  return Math.max(0, foreheadY - noseToChin * FRAMING.hairExtensionFactor);
}

function buildFramingMetrics(
  crop: { x: number; y: number; width: number; height: number },
  crownY: number,
  chinY: number,
  eyeLineY: number
): PassportFramingMetrics {
  return {
    crownMarginRatio: (crownY - crop.y) / crop.height,
    chinToBottomRatio: (crop.y + crop.height - chinY) / crop.height,
    eyeLineFromTopRatio: (eyeLineY - crop.y) / crop.height
  };
}

/**
 * Builds a passport crop from a content box (crown → shoulders) with explicit
 * padding above the hair and below the chin, then fits it into the source image.
 */
export function derivePassportCrop(input: PassportCropInput): PassportCropOutput {
  const {
    template,
    sourceWidth,
    sourceHeight,
    faceBoundingBox,
    leftEye,
    rightEye,
    noseTip,
    chin,
    forehead
  } = input;

  const outputWidth = mmToPixels(template.width_mm, template.dpi);
  const outputHeight = mmToPixels(template.height_mm, template.dpi);
  const outputAspect = outputWidth / outputHeight;

  const faceCenterX = faceBoundingBox.x + faceBoundingBox.width / 2;
  const eyeLineY = (leftEye.y + rightEye.y) / 2;
  const crownY = estimateCrownY(forehead, noseTip, chin);
  const headHeight = Math.max(chin.y - crownY, 1);
  const targetHeadRatio = (template.head_ratio_min + template.head_ratio_max) / 2 / 100;
  const targetHeadHeight = targetHeadRatio * outputHeight;

  const topPadding = headHeight * FRAMING.topPaddingFactor;
  const bottomPadding = headHeight * FRAMING.bottomPaddingFactor;

  const idealTop = crownY - topPadding;
  const idealBottom = chin.y + bottomPadding;
  let cropHeight = idealBottom - idealTop;
  let cropWidth = cropHeight * outputAspect;

  const scaleToFit = Math.min(1, sourceWidth / cropWidth, sourceHeight / cropHeight);

  if (scaleToFit < 1) {
    cropHeight *= scaleToFit;
    cropWidth *= scaleToFit;
  }

  const cropX = faceCenterX - cropWidth / 2;
  const cropY = scaleToFit < 1 ? crownY - topPadding * scaleToFit : idealTop;

  // Do NOT clamp or truncate coordinates to image borders.
  // This keeps the face perfectly centered and preserves the aspect ratio.
  // The canvas drawing helper handles negative coordinates by padding with white.
  const crop = {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight)
  };

  const headRatio = headHeight / crop.height;
  const faceCenterInCropX = faceCenterX - crop.x;
  const centered =
    Math.abs(faceCenterInCropX - crop.width / 2) / (crop.width / 2) < template.face_center_tolerance;

  return {
    crop,
    outputWidth,
    outputHeight,
    headRatio,
    centered,
    targetHeadHeight,
    framing: buildFramingMetrics(crop, crownY, chin.y, eyeLineY)
  };
}

export function getFramingMetrics(
  crop: PassportCropOutput["crop"],
  crownY: number,
  chinY: number,
  eyeLineY: number
): PassportFramingMetrics {
  return buildFramingMetrics(crop, crownY, chinY, eyeLineY);
}
