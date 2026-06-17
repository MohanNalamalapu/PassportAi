import { describe, expect, it } from "vitest";
import { evaluateCompliance, measureFramingFromCrop } from "@/src/services/compliance-engine";
import type { DocumentTemplate } from "@/src/types/passport";
import type { FaceDetectionResult } from "@/src/types/face";
import type { ImageAnalysis } from "@/src/types/compliance";
import type { PassportCropOutput } from "@/src/services/crop-engine";

const template: DocumentTemplate = {
  id: "test_passport",
  country: "Testland",
  document: "Passport",
  width_mm: 35,
  height_mm: 45,
  background: "white",
  dpi: 300,
  head_ratio_min: 50,
  head_ratio_max: 80,
  face_center_tolerance: 0.15,
  min_width_px: 400,
  min_height_px: 400
};

const faceData: FaceDetectionResult = {
  faceCount: 1,
  boundingBox: { x: 280, y: 140, width: 200, height: 260, score: 1 },
  landmarks: [],
  features: {
    leftEye: { x: 280, y: 200, z: 0 },
    rightEye: { x: 320, y: 200, z: 0 },
    noseTip: { x: 300, y: 250, z: 0 },
    chin: { x: 300, y: 350, z: 0 },
    forehead: { x: 300, y: 150, z: 0 }
  },
  sourceWidth: 800,
  sourceHeight: 1000
};

const goodCrop: PassportCropOutput = {
  crop: { x: 100, y: 20, width: 400, height: 500 },
  outputWidth: 413,
  outputHeight: 531,
  headRatio: 0.62,
  centered: true,
  targetHeadHeight: 382,
  framing: {
    crownMarginRatio: 0.12,
    chinToBottomRatio: 0.28,
    eyeLineFromTopRatio: 0.42
  }
};

const goodAnalysis: ImageAnalysis = {
  brightness: 140,
  sharpness: 45,
  contrast: 35,
  backgroundUniformity: 80,
  eyeRegionBrightness: 120,
  faceRegionBrightness: 150,
  eyesVisible: true,
  sunglassesLikely: false
};

describe("compliance-engine", () => {
  it("returns compliant when framing is genuinely good", () => {
    const result = evaluateCompliance({
      template,
      crop: goodCrop,
      faceData,
      imageAnalysis: goodAnalysis,
      sourceWidth: 800,
      sourceHeight: 1000,
      backgroundRemoved: true
    });

    expect(result.compliant).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it("fails shoulders, headroom, and centering for tight off-center crops", () => {
    const tightFaceData: FaceDetectionResult = {
      ...faceData,
      features: {
        leftEye: { x: 100, y: 200, z: 0 },
        rightEye: { x: 150, y: 200, z: 0 },
        noseTip: { x: 125, y: 250, z: 0 },
        chin: { x: 125, y: 310, z: 0 },
        forehead: { x: 125, y: 160, z: 0 }
      }
    };

    const tightCrop: PassportCropOutput = {
      ...goodCrop,
      crop: { x: 40, y: 40, width: 220, height: 200 },
      headRatio: 0.54,
      centered: false,
      framing: {
        crownMarginRatio: 0.05,
        chinToBottomRatio: 0.12,
        eyeLineFromTopRatio: 0.42
      }
    };

    const measured = measureFramingFromCrop(tightCrop.crop, tightFaceData);
    expect(measured.chinToBottomRatio).toBeLessThan(0.24);
    expect(measured.horizontalOffset).toBeGreaterThan(0.05);

    const result = evaluateCompliance({
      template,
      crop: tightCrop,
      faceData: tightFaceData,
      imageAnalysis: goodAnalysis,
      sourceWidth: 512,
      sourceHeight: 764,
      backgroundRemoved: true
    });

    expect(result.compliant).toBe(false);
    expect(result.score).toBeLessThan(100);

    const shoulders = result.checks.find((check) => check.id === "shoulders_visible");
    const centering = result.checks.find((check) => check.id === "face_centering");
    expect(shoulders?.passed).toBe(false);
    expect(centering?.passed).toBe(false);
  });

  it("passes background check when background removal succeeded", () => {
    const result = evaluateCompliance({
      template,
      crop: goodCrop,
      faceData,
      imageAnalysis: { ...goodAnalysis, backgroundUniformity: 10 },
      sourceWidth: 512,
      sourceHeight: 764,
      backgroundRemoved: true
    });

    const backgroundCheck = result.checks.find((check) => check.id === "plain_background");
    expect(backgroundCheck?.passed).toBe(true);
  });

  it("passes facing camera for a forward face even with a wide hair bounding box", () => {
    const forwardFaceData: FaceDetectionResult = {
      ...faceData,
      boundingBox: { x: 150, y: 100, width: 420, height: 320, score: 1 },
      features: {
        leftEye: { x: 280, y: 200, z: 0.01 },
        rightEye: { x: 320, y: 200, z: -0.01 },
        noseTip: { x: 300, y: 250, z: 0 },
        chin: { x: 300, y: 350, z: 0 },
        forehead: { x: 300, y: 150, z: 0 }
      }
    };

    const result = evaluateCompliance({
      template,
      crop: goodCrop,
      faceData: forwardFaceData,
      imageAnalysis: goodAnalysis,
      sourceWidth: 800,
      sourceHeight: 1000,
      backgroundRemoved: true
    });

    const facingCheck = result.checks.find((check) => check.id === "facing_camera");
    expect(facingCheck?.passed).toBe(true);
  });

  it("flags when face is turned away from the camera", () => {
    const turnedFaceData: FaceDetectionResult = {
      ...faceData,
      features: {
        leftEye: { x: 280, y: 200, z: 0.12 },
        rightEye: { x: 300, y: 200, z: -0.12 },
        noseTip: { x: 318, y: 250, z: 0 },
        chin: { x: 325, y: 350, z: 0 },
        forehead: { x: 320, y: 150, z: 0 }
      }
    };

    const result = evaluateCompliance({
      template,
      crop: goodCrop,
      faceData: turnedFaceData,
      imageAnalysis: goodAnalysis,
      sourceWidth: 800,
      sourceHeight: 1000,
      backgroundRemoved: true
    });

    const facingCheck = result.checks.find((check) => check.id === "facing_camera");
    expect(facingCheck?.passed).toBe(false);
    expect(result.issues.some((issue) => issue.includes("Look directly at the camera"))).toBe(true);
  });

  it("flags sunglasses and low resolution as issues", () => {
    const result = evaluateCompliance({
      template,
      crop: { ...goodCrop, outputWidth: 200, outputHeight: 200 },
      faceData,
      imageAnalysis: {
        ...goodAnalysis,
        sunglassesLikely: true,
        eyesVisible: false
      },
      sourceWidth: 200,
      sourceHeight: 200
    });

    expect(result.compliant).toBe(false);
    expect(result.issues.some((issue) => issue.includes("sunglasses"))).toBe(true);
  });
});
