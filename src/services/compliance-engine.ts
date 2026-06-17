import type { DocumentTemplate } from "@/src/types/passport";
import type { FaceDetectionResult } from "@/src/types/face";
import type { PassportCropOutput } from "@/src/services/crop-engine";
import type { ComplianceResult, ComplianceCheckResult, ImageAnalysis } from "@/src/types/compliance";

export interface ComplianceCheckInput {
  template: DocumentTemplate;
  crop: PassportCropOutput;
  faceData: FaceDetectionResult;
  imageAnalysis: ImageAnalysis;
  sourceWidth: number;
  sourceHeight: number;
  backgroundRemoved?: boolean;
}

/** Strict passport framing thresholds measured on the final crop. */
const PASSPORT_FRAMING = {
  minCrownMargin: 0.1,
  idealCrownMargin: 0.12,
  minChinToBottom: 0.18,
  idealChinToBottom: 0.24,
  maxHorizontalOffset: 0.06,
  headRatioAbsoluteMin: 0.45,
  headRatioAbsoluteMax: 0.85,
  maxYawDegrees: 30,
  maxPitchDegrees: 24,
  maxRollDegrees: 18
} as const;

export interface MeasuredFraming {
  crownMarginRatio: number;
  chinToBottomRatio: number;
  horizontalOffset: number;
}

/** Re-measures framing from landmarks against the actual crop box (after clamping). */
export function measureFramingFromCrop(
  cropBox: PassportCropOutput["crop"],
  faceData: FaceDetectionResult
): MeasuredFraming {
  const { forehead, chin, noseTip, leftEye, rightEye } = faceData.features;
  const noseToChin = Math.max(chin.y - noseTip.y, 1);
  const crownY = Math.max(0, forehead.y - noseToChin * 0.8);
  const faceCenterX = (leftEye.x + rightEye.x) / 2;
  const cropCenterX = cropBox.x + cropBox.width / 2;

  return {
    crownMarginRatio: (crownY - cropBox.y) / cropBox.height,
    chinToBottomRatio: (cropBox.y + cropBox.height - chin.y) / cropBox.height,
    horizontalOffset: Math.abs(faceCenterX - cropCenterX) / cropBox.width
  };
}

export function evaluateCompliance(input: ComplianceCheckInput): ComplianceResult {
  const { template, crop, faceData, imageAnalysis, sourceWidth, sourceHeight, backgroundRemoved } = input;
  const checks: ComplianceCheckResult[] = [];
  const issues: string[] = [];
  const warnings: string[] = [];
  const framing = measureFramingFromCrop(crop.crop, faceData);

  // 1. Single face check
  const singleFacePassed = faceData.faceCount === 1;
  checks.push({
    id: "single_face",
    label: "Single face",
    passed: singleFacePassed,
    severity: singleFacePassed ? "info" : "error",
    message: singleFacePassed
      ? "Exactly one face detected."
      : "Photo must contain exactly one visible face."
  });

  if (!singleFacePassed) {
    issues.push("Photo must contain exactly one visible face.");
  }

  // 2. Head ratio
  const headRatioMin = template.head_ratio_min / 100;
  const headRatioMax = template.head_ratio_max / 100;
  const headRatioInTemplate = crop.headRatio >= headRatioMin && crop.headRatio <= headRatioMax;
  const headRatioExtreme =
    crop.headRatio < PASSPORT_FRAMING.headRatioAbsoluteMin ||
    crop.headRatio > PASSPORT_FRAMING.headRatioAbsoluteMax;
  const headRatioPassed = headRatioInTemplate && !headRatioExtreme;

  checks.push({
    id: "head_ratio",
    label: "Head ratio",
    passed: headRatioPassed,
    severity: headRatioExtreme ? "error" : headRatioPassed ? "info" : "warning",
    expected: `${template.head_ratio_min}-${template.head_ratio_max}%`,
    actual: `${Math.round(crop.headRatio * 100)}%`,
    message: headRatioPassed
      ? `Head occupies ${Math.round(crop.headRatio * 100)}% of frame.`
      : `Head is ${Math.round(crop.headRatio * 100)}% of frame; ideal is ${template.head_ratio_min}-${template.head_ratio_max}%.`
  });

  if (!headRatioPassed) {
    if (headRatioExtreme) {
      issues.push(`Head size looks incorrect at ${Math.round(crop.headRatio * 100)}% of the frame.`);
    } else {
      warnings.push(
        `Head is ${Math.round(crop.headRatio * 100)}% of frame (ideal ${template.head_ratio_min}-${template.head_ratio_max}%).`
      );
    }
  }

  // 3. Headroom above hair — strict, measured on final crop
  const headroomPassed = framing.crownMarginRatio >= PASSPORT_FRAMING.minCrownMargin;
  checks.push({
    id: "headroom",
    label: "Headroom above hair",
    passed: headroomPassed,
    severity: "error",
    expected: `>= ${Math.round(PASSPORT_FRAMING.idealCrownMargin * 100)}%`,
    actual: `${Math.round(framing.crownMarginRatio * 100)}%`,
    message: headroomPassed
      ? `Clear space above the hair (${Math.round(framing.crownMarginRatio * 100)}%).`
      : `Not enough space above the hair (${Math.round(framing.crownMarginRatio * 100)}%). Step back or lower the camera.`
  });

  if (!headroomPassed) {
    issues.push("Passport photos need visible space above the top of the head.");
  }

  // 4. Shoulders visible — strict, measured below chin in final crop
  const shouldersPassed = framing.chinToBottomRatio >= PASSPORT_FRAMING.minChinToBottom;
  checks.push({
    id: "shoulders_visible",
    label: "Shoulders visible",
    passed: shouldersPassed,
    severity: "error",
    expected: `>= ${Math.round(PASSPORT_FRAMING.idealChinToBottom * 100)}%`,
    actual: `${Math.round(framing.chinToBottomRatio * 100)}%`,
    message: shouldersPassed
      ? `Neck and upper shoulders are visible (${Math.round(framing.chinToBottomRatio * 100)}% below chin).`
      : `Shoulders are cut off (${Math.round(framing.chinToBottomRatio * 100)}% below chin). Step back to include your shoulders.`
  });

  if (!shouldersPassed) {
    issues.push("Upper shoulders must be visible in a passport photo.");
  }

  // 5. Face centering — measured from eye line vs crop center
  const faceCenteringPassed = framing.horizontalOffset <= PASSPORT_FRAMING.maxHorizontalOffset;
  checks.push({
    id: "face_centering",
    label: "Face centering",
    passed: faceCenteringPassed,
    severity: "error",
    expected: `<= ${Math.round(PASSPORT_FRAMING.maxHorizontalOffset * 100)}% offset`,
    actual: `${Math.round(framing.horizontalOffset * 100)}%`,
    message: faceCenteringPassed
      ? "Face is centered horizontally in the frame."
      : `Face is off-center by ${Math.round(framing.horizontalOffset * 100)}%. Stand directly in front of the camera.`
  });

  if (!faceCenteringPassed) {
    issues.push("Face must be centered horizontally in the passport frame.");
  }

  // 6. Facing camera — landmark-based pose (robust to wide hair bounding boxes)
  const estimatedPose = estimateFacePoseFromLandmarks(faceData.features);
  const maxYaw = template.max_yaw ?? PASSPORT_FRAMING.maxYawDegrees;
  const maxPitch = template.max_pitch ?? PASSPORT_FRAMING.maxPitchDegrees;
  const maxRoll = template.max_roll ?? PASSPORT_FRAMING.maxRollDegrees;
  const facingCameraPassed =
    Math.abs(estimatedPose.yaw) <= maxYaw &&
    Math.abs(estimatedPose.pitch) <= maxPitch &&
    Math.abs(estimatedPose.roll) <= maxRoll;

  checks.push({
    id: "facing_camera",
    label: "Facing camera",
    passed: facingCameraPassed,
    severity: "error",
    expected: `yaw <= ${maxYaw}°, pitch <= ${maxPitch}°, roll <= ${maxRoll}°`,
    actual: `yaw ${Math.round(estimatedPose.yaw)}°, pitch ${Math.round(estimatedPose.pitch)}°, roll ${Math.round(estimatedPose.roll)}°`,
    message: facingCameraPassed
      ? "Face is looking directly at the camera."
      : "Face must look straight at the camera with your head level."
  });

  if (!facingCameraPassed) {
    issues.push("Look directly at the camera with your head straight and level.");
  }

  // 7. Brightness check (if template specifies limits)
  if (template.brightness_min !== undefined || template.brightness_max !== undefined) {
    const brightnessMin = template.brightness_min ?? 0;
    const brightnessMax = template.brightness_max ?? 255;
    const brightnessPassed = imageAnalysis.brightness >= brightnessMin && imageAnalysis.brightness <= brightnessMax;

    checks.push({
      id: "brightness",
      label: "Brightness",
      passed: brightnessPassed,
      severity: brightnessPassed ? "info" : "warning",
      expected: `${brightnessMin}-${brightnessMax}`,
      actual: `${imageAnalysis.brightness}`,
      message: brightnessPassed
        ? `Brightness is ${imageAnalysis.brightness}, which is acceptable.`
        : `Brightness is ${imageAnalysis.brightness}, but should be ${brightnessMin}-${brightnessMax}.`
    });

    if (!brightnessPassed) {
      warnings.push(`Lighting is ${imageAnalysis.brightness > brightnessMax ? "too bright" : "too dim"}.`);
    }
  }

  // 8. Sharpness check (if template specifies limit)
  if (template.sharpness_min !== undefined) {
    const sharpnessMin = template.sharpness_min;
    const sharpnessPassed = imageAnalysis.sharpness >= sharpnessMin;

    checks.push({
      id: "sharpness",
      label: "Image sharpness",
      passed: sharpnessPassed,
      severity: sharpnessPassed ? "info" : "warning",
      expected: `>= ${sharpnessMin}`,
      actual: `${Math.round(imageAnalysis.sharpness)}`,
      message: sharpnessPassed
        ? `Image is sharp (${Math.round(imageAnalysis.sharpness)} / 100).`
        : `Image may be blurry. Consider retaking the photo.`
    });

    if (!sharpnessPassed) {
      warnings.push("Image is blurry; consider retaking the photo in better lighting.");
    }
  }

  // 9. Eyes visible check
  const eyesVisiblePassed = imageAnalysis.eyesVisible && !imageAnalysis.sunglassesLikely;
  checks.push({
    id: "eyes_visible",
    label: "Eyes visible",
    passed: eyesVisiblePassed,
    severity: eyesVisiblePassed ? "info" : "error",
    message: eyesVisiblePassed
      ? "Both eyes are visible and unobstructed."
      : "Eyes must be clearly visible and open."
  });

  if (!eyesVisiblePassed) {
    issues.push("Eyes must be clearly visible in the photo.");
  }

  // 10. No sunglasses check
  const noSunglassesPassed = !imageAnalysis.sunglassesLikely;
  checks.push({
    id: "no_sunglasses",
    label: "No sunglasses",
    passed: noSunglassesPassed,
    severity: noSunglassesPassed ? "info" : "error",
    message: noSunglassesPassed
      ? "No sunglasses detected."
      : "Sunglasses or tinted eyewear are not allowed."
  });

  if (!noSunglassesPassed) {
    issues.push("Remove sunglasses or tinted eyewear before taking the photo.");
  }

  // 11. Plain background check
  const backgroundUniformityMin = 55;
  const plainBackgroundPassed =
    backgroundRemoved || imageAnalysis.backgroundUniformity >= backgroundUniformityMin;

  checks.push({
    id: "plain_background",
    label: "Plain background",
    passed: plainBackgroundPassed,
    severity: plainBackgroundPassed ? "info" : "warning",
    expected: backgroundRemoved ? "Handled by background removal" : `>= ${backgroundUniformityMin}`,
    actual: backgroundRemoved ? "Replaced" : `${imageAnalysis.backgroundUniformity}`,
    message: plainBackgroundPassed
      ? backgroundRemoved
        ? "Original background replaced with the required passport color."
        : "Background appears sufficiently plain."
      : "Background is not uniform enough for automatic removal. Use a plain wall if possible."
  });

  if (!plainBackgroundPassed) {
    warnings.push("Use a plain, light-colored background for best automatic removal results.");
  }

  // 12. Resolution check
  const resolutionPassed =
    crop.outputWidth >= template.min_width_px &&
    crop.outputHeight >= template.min_height_px &&
    crop.crop.width >= 120 &&
    crop.crop.height >= 120 &&
    Math.min(sourceWidth, sourceHeight) >= 320;

  checks.push({
    id: "resolution",
    label: "Resolution",
    passed: resolutionPassed,
    severity: resolutionPassed ? "info" : "error",
    expected: `>= ${template.min_width_px} x ${template.min_height_px} px output`,
    actual: `${crop.outputWidth} x ${crop.outputHeight} px (source ${sourceWidth} x ${sourceHeight})`,
    message: resolutionPassed
      ? "Output resolution meets template requirements."
      : "Source image does not have enough detail for this document template."
  });

  if (!resolutionPassed) {
    issues.push(
      "Source photo is too small or cropped too tightly. Upload a higher-resolution image with head and shoulders visible."
    );
  }

  const errorChecks = checks.filter((c) => c.severity === "error" && !c.passed);
  const warningChecks = checks.filter((c) => c.severity === "warning" && !c.passed);

  let score = 100;
  score -= errorChecks.length * 20;
  score -= warningChecks.length * 5;
  score = Math.max(0, Math.min(100, score));

  const compliant = errorChecks.length === 0;

  return {
    templateId: template.id,
    compliant,
    score,
    checks,
    issues,
    warnings,
    evaluatedAt: new Date().toISOString()
  };
}

function estimateFacePoseFromLandmarks(features: FaceDetectionResult["features"]) {
  const { leftEye, rightEye, noseTip, chin, forehead } = features;

  const interEyeDistance = Math.max(Math.abs(rightEye.x - leftEye.x), 1);
  const eyeCenterX = (leftEye.x + rightEye.x) / 2;

  // Yaw from nose horizontal offset relative to eye center.
  const noseOffsetRatio = (noseTip.x - eyeCenterX) / interEyeDistance;
  const yawFromNose = noseOffsetRatio * 40;

  // Yaw from MediaPipe depth when available.
  const yawFromDepth = (rightEye.z - leftEye.z) * 120;
  const yaw = combineYawEstimates(yawFromNose, yawFromDepth);

  // Roll from eye line tilt.
  const roll =
    (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) / Math.PI;

  // Pitch from vertical face proportions.
  const upperFace = Math.max(noseTip.y - forehead.y, 1);
  const lowerFace = Math.max(chin.y - noseTip.y, 1);
  const pitchRatio = lowerFace / upperFace;
  const pitch = clampAngle(((pitchRatio - 1.05) / 0.35) * 18, -30, 30);

  return { yaw, pitch, roll };
}

function combineYawEstimates(yawFromNose: number, yawFromDepth: number) {
  const depthIsReliable = Math.abs(yawFromDepth) >= 4;
  const noseIsReliable = Math.abs(yawFromNose) >= 4;
  const sameDirection =
    Math.sign(yawFromNose) === Math.sign(yawFromDepth) ||
    !noseIsReliable ||
    !depthIsReliable;

  if (sameDirection && depthIsReliable && noseIsReliable) {
    return clampAngle(yawFromNose * 0.6 + yawFromDepth * 0.4, -45, 45);
  }

  // Conflicting depth/2D signals are common with hair volume or eyewear — trust nose alignment.
  if (Math.abs(yawFromNose) >= Math.abs(yawFromDepth)) {
    return clampAngle(yawFromNose, -45, 45);
  }

  return clampAngle(yawFromDepth, -45, 45);
}

function clampAngle(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
