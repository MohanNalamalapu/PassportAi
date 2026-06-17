"use client";

import type { FaceDetectionResult, ImagePoint } from "@/src/types/face";
import { runFaceMesh } from "@/src/lib/mediapipe-loader";

function ensureImageLoaded(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
      resolve();
      return;
    }

    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image for face detection."));
  });
}

function toImagePoint(landmark: { x: number; y: number; z: number }, width: number, height: number): ImagePoint {
  return {
    x: Math.round(landmark.x * width),
    y: Math.round(landmark.y * height),
    z: landmark.z * width
  };
}

function getFeaturePoint(
  landmarks: Array<{ x: number; y: number; z: number }>,
  index: number,
  width: number,
  height: number
): ImagePoint {
  return toImagePoint(landmarks[index], width, height);
}

function boundingBoxFromLandmarks(
  landmarks: Array<{ x: number; y: number; z: number }>,
  width: number,
  height: number
) {
  const xs = landmarks.map((landmark) => landmark.x * width);
  const ys = landmarks.map((landmark) => landmark.y * height);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const x = Math.max(0, Math.round(minX));
  const y = Math.max(0, Math.round(minY));
  const boxWidth = Math.round(maxX - minX);
  const boxHeight = Math.round(maxY - minY);

  return {
    x,
    y,
    width: Math.min(width - x, boxWidth),
    height: Math.min(height - y, boxHeight),
    score: 1
  };
}

export async function detectFaceLandmarks(image: HTMLImageElement): Promise<FaceDetectionResult> {
  await ensureImageLoaded(image);

  const width = image.naturalWidth;
  const height = image.naturalHeight;

  let meshResults;

  try {
    meshResults = await runFaceMesh(image);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("Module.arguments") || message.includes("abort(")) {
      throw new Error(
        "Face detection failed to initialize. Refresh the page and try again."
      );
    }

    throw new Error(`Face detection failed: ${message}`);
  }

  const faceLandmarks = meshResults.multiFaceLandmarks ?? [];
  const faceCount = faceLandmarks.length;

  if (faceCount === 0) {
    throw new Error("No face was detected in the image.");
  }

  if (faceCount > 1) {
    throw new Error("Please upload a photo with a single visible face.");
  }

  const landmarks = faceLandmarks[0];
  const boundingBox = boundingBoxFromLandmarks(landmarks, width, height);
  const leftEye = getFeaturePoint(landmarks, 33, width, height);
  const rightEye = getFeaturePoint(landmarks, 263, width, height);
  const noseTip = getFeaturePoint(landmarks, 1, width, height);
  const chin = getFeaturePoint(landmarks, 152, width, height);
  const forehead = getFeaturePoint(landmarks, 10, width, height);

  const mappedLandmarks = landmarks.map((landmark) => toImagePoint(landmark, width, height));

  return {
    faceCount: 1,
    boundingBox,
    landmarks: mappedLandmarks,
    features: {
      leftEye,
      rightEye,
      noseTip,
      chin,
      forehead
    },
    sourceWidth: width,
    sourceHeight: height
  };
}
