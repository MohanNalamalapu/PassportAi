import { describe, expect, it } from "vitest";
import { derivePassportCrop, mmToPixels } from "@/src/services/crop-engine";
import type { DocumentTemplate } from "@/src/types/passport";

const indiaTemplate: DocumentTemplate = {
  id: "india_passport",
  country: "India",
  document: "Passport",
  width_mm: 35,
  height_mm: 45,
  background: "white",
  dpi: 300,
  head_ratio_min: 50,
  head_ratio_max: 80,
  face_center_tolerance: 0.15,
  min_width_px: 413,
  min_height_px: 531
};

const usaTemplate: DocumentTemplate = {
  id: "usa_passport",
  country: "United States",
  document: "Passport",
  width_mm: 51,
  height_mm: 51,
  background: "white",
  dpi: 300,
  head_ratio_min: 50,
  head_ratio_max: 69,
  face_center_tolerance: 0.15,
  min_width_px: 600,
  min_height_px: 600
};

const selfieInput = {
  sourceWidth: 512,
  sourceHeight: 764,
  faceBoundingBox: { x: 169, y: 200, width: 174, height: 174 },
  leftEye: { x: 230, y: 290, z: 0 },
  rightEye: { x: 282, y: 290, z: 0 },
  noseTip: { x: 256, y: 320, z: 0 },
  chin: { x: 256, y: 420, z: 0 },
  forehead: { x: 256, y: 240, z: 0 }
};

describe("crop-engine", () => {
  it("converts millimeters to pixels at a given DPI", () => {
    expect(mmToPixels(35, 300)).toBe(413);
    expect(mmToPixels(45, 300)).toBe(531);
  });

  it("includes generous headroom and shoulder space like professional tools", () => {
    const result = derivePassportCrop({
      template: indiaTemplate,
      ...selfieInput
    });

    expect(result.crop.height).toBeGreaterThan(selfieInput.faceBoundingBox.height * 1.8);
    expect(result.framing.crownMarginRatio).toBeGreaterThanOrEqual(0.08);
    expect(result.framing.chinToBottomRatio).toBeGreaterThanOrEqual(0.18);
    expect(result.crop.y + result.crop.height).toBeGreaterThan(selfieInput.chin.y + 60);
  });

  it("frames US passport photos with competitor-like proportions", () => {
    const result = derivePassportCrop({
      template: usaTemplate,
      ...selfieInput
    });

    expect(result.headRatio).toBeGreaterThanOrEqual(0.42);
    expect(result.headRatio).toBeLessThanOrEqual(0.72);
    expect(result.framing.eyeLineFromTopRatio).toBeGreaterThan(0.3);
    expect(result.framing.eyeLineFromTopRatio).toBeLessThan(0.55);
    expect(result.framing.chinToBottomRatio).toBeGreaterThanOrEqual(0.18);
  });
});
