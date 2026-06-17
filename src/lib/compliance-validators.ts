import type { ImageAnalysis } from "@/src/types/compliance";

import type { FaceFeaturePoints } from "@/src/types/face";



export function transformFeaturesForCrop(

  features: FaceFeaturePoints,

  crop: { x: number; y: number; width: number; height: number },

  outputWidth: number,

  outputHeight: number

): FaceFeaturePoints {

  const scaleX = outputWidth / crop.width;

  const scaleY = outputHeight / crop.height;



  const toCropSpace = (point: { x: number; y: number; z?: number }) => ({

    x: (point.x - crop.x) * scaleX,

    y: (point.y - crop.y) * scaleY,

    z: point.z ?? 0

  });



  return {

    leftEye: toCropSpace(features.leftEye),

    rightEye: toCropSpace(features.rightEye),

    noseTip: toCropSpace(features.noseTip),

    chin: toCropSpace(features.chin),

    forehead: toCropSpace(features.forehead)

  };

}



/**

 * Analyzes an image from a File and returns brightness, sharpness, and contrast metrics.

 */

export async function analyzeImage(file: File): Promise<ImageAnalysis> {

  const image = await loadImageFromFile(file);

  return analyzeImageElement(image);

}



/**

 * Analyzes a loaded HTMLImageElement for compliance metrics.

 */

export async function analyzeImageElement(

  image: HTMLImageElement,

  features?: FaceFeaturePoints

): Promise<ImageAnalysis> {

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d");



  if (!ctx) {

    throw new Error("Unable to create canvas context for image analysis.");

  }



  const maxDim = 512;

  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));

  canvas.width = Math.round(image.naturalWidth * scale);

  canvas.height = Math.round(image.naturalHeight * scale);



  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);



  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const data = imageData.data;



  const brightness = calculateBrightness(data);

  const sharpness = calculateSharpness(imageData);

  const contrast = calculateContrast(data);

  const backgroundUniformity = calculateBackgroundUniformity(imageData);



  let eyeRegionBrightness = brightness;

  let faceRegionBrightness = brightness;

  let sunglassesLikely = false;

  let eyesVisible = true;



  if (features) {

    const eyeAnalysis = analyzeEyeRegions(imageData, features, scale);

    eyeRegionBrightness = eyeAnalysis.eyeRegionBrightness;

    faceRegionBrightness = eyeAnalysis.cheekBrightness;

    sunglassesLikely = eyeAnalysis.sunglassesLikely;

    eyesVisible = eyeAnalysis.eyesVisible;

  }



  return {

    brightness,

    sharpness,

    contrast,

    backgroundUniformity,

    eyeRegionBrightness,

    faceRegionBrightness,

    eyesVisible,

    sunglassesLikely

  };

}



interface EyeRegionAnalysis {

  eyeRegionBrightness: number;

  cheekBrightness: number;

  sunglassesLikely: boolean;

  eyesVisible: boolean;

}



function analyzeEyeRegions(

  imageData: ImageData,

  features: FaceFeaturePoints,

  scale: number

): EyeRegionAnalysis {

  const leftEye = scalePoint(features.leftEye, scale);

  const rightEye = scalePoint(features.rightEye, scale);

  const noseTip = scalePoint(features.noseTip, scale);



  const interEyeDistance = Math.max(Math.abs(rightEye.x - leftEye.x), 8);

  const eyeRadius = Math.max(6, Math.round(interEyeDistance * 0.22));



  const eyeLineY = (leftEye.y + rightEye.y) / 2;

  const leftEyePatch = getPatchStats(imageData, leftEye.x, leftEye.y, eyeRadius);

  const rightEyePatch = getPatchStats(imageData, rightEye.x, rightEye.y, eyeRadius);

  const leftCheekPatch = getPatchStats(imageData, leftEye.x - eyeRadius, noseTip.y, eyeRadius);

  const rightCheekPatch = getPatchStats(imageData, rightEye.x + eyeRadius, noseTip.y, eyeRadius);

  const noseBridgePatch = getPatchStats(

    imageData,

    Math.round((leftEye.x + rightEye.x) / 2),

    Math.round((eyeLineY + noseTip.y) / 2),

    Math.max(4, Math.round(eyeRadius * 0.75))

  );



  const eyeRegionBrightness = Math.round((leftEyePatch.mean + rightEyePatch.mean) / 2);

  const cheekBrightness = Math.round((leftCheekPatch.mean + rightCheekPatch.mean) / 2);

  const skinReferenceBrightness = Math.max(cheekBrightness, noseBridgePatch.mean);



  const eyesAreDark = leftEyePatch.mean < 82 && rightEyePatch.mean < 82;
  const eyesAreVeryDark = leftEyePatch.mean < 62 && rightEyePatch.mean < 62;

  const eyesAreUniform = leftEyePatch.variance < 650 && rightEyePatch.variance < 650;

  const eyesMuchDarkerThanSkin =

    eyeRegionBrightness < skinReferenceBrightness * 0.5 && skinReferenceBrightness > 90;

  const eyesLackDetail =

    leftEyePatch.edgeDensity < 0.045 && rightEyePatch.edgeDensity < 0.045;

  const bothEyesHaveSomeDetail =

    leftEyePatch.edgeDensity >= 0.035 || rightEyePatch.edgeDensity >= 0.035;



  const sunglassesLikely =

    eyesAreVeryDark &&

    eyesAreUniform &&

    eyesMuchDarkerThanSkin &&

    eyesLackDetail;



  const eyesVisible =

    !sunglassesLikely &&

    (eyeRegionBrightness >= 45 || !eyesAreDark || bothEyesHaveSomeDetail) &&

    checkEyeLandmarkGeometry(features, scale);



  return {

    eyeRegionBrightness,

    cheekBrightness,

    sunglassesLikely,

    eyesVisible

  };

}



async function loadImageFromFile(file: File): Promise<HTMLImageElement> {

  return new Promise((resolve, reject) => {

    const url = URL.createObjectURL(file);

    const image = new Image();



    image.onload = () => {

      URL.revokeObjectURL(url);

      resolve(image);

    };



    image.onerror = () => {

      URL.revokeObjectURL(url);

      reject(new Error("Failed to load image for analysis."));

    };



    image.src = url;

  });

}



function calculateBrightness(data: Uint8ClampedArray): number {

  let sum = 0;

  let count = 0;



  for (let i = 0; i < data.length; i += 16) {

    sum += data[i] + data[i + 1] + data[i + 2];

    count++;

  }



  return Math.round(sum / (count * 3));

}



function calculateSharpness(imageData: ImageData): number {

  const { data, width, height } = imageData;

  let edges = 0;

  let pixels = 0;



  for (let y = 1; y < height - 1; y++) {

    for (let x = 1; x < width - 1; x++) {

      const idx = (y * width + x) * 4;

      const center = data[idx];

      const up = data[((y - 1) * width + x) * 4];

      const down = data[((y + 1) * width + x) * 4];

      const left = data[(y * width + (x - 1)) * 4];

      const right = data[(y * width + (x + 1)) * 4];

      const gradient =

        Math.abs(center - up) +

        Math.abs(center - down) +

        Math.abs(center - left) +

        Math.abs(center - right);



      if (gradient > 50) {

        edges++;

      }

      pixels++;

    }

  }



  return Math.min(100, Math.round((edges / pixels) * 200));

}



function calculateContrast(data: Uint8ClampedArray): number {

  let sum = 0;

  let count = 0;

  let brightnessSum = 0;



  for (let i = 0; i < data.length; i += 16) {

    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

    brightnessSum += brightness;

    count++;

  }



  const avgBrightness = brightnessSum / count;



  count = 0;

  for (let i = 0; i < data.length; i += 16) {

    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

    sum += Math.pow(brightness - avgBrightness, 2);

    count++;

  }



  const variance = sum / count;

  const stdDev = Math.sqrt(variance);



  return Math.min(100, Math.round((stdDev / 128) * 100));

}



function calculateBackgroundUniformity(imageData: ImageData): number {

  const { width, height } = imageData;

  const cornerSize = Math.max(8, Math.round(Math.min(width, height) * 0.12));

  const corners = [

    getRegionStats(imageData, 0, 0, cornerSize, cornerSize),

    getRegionStats(imageData, width - cornerSize, 0, cornerSize, cornerSize),

    getRegionStats(imageData, 0, height - cornerSize, cornerSize, cornerSize),

    getRegionStats(imageData, width - cornerSize, height - cornerSize, cornerSize, cornerSize)

  ];



  const avgVariance =

    corners.reduce((sum, corner) => sum + corner.variance, 0) / corners.length;



  return Math.max(0, Math.min(100, Math.round(100 - avgVariance * 2)));

}



function getRegionStats(

  imageData: ImageData,

  startX: number,

  startY: number,

  regionWidth: number,

  regionHeight: number

) {

  const { data, width } = imageData;

  let sum = 0;

  let sumSquares = 0;

  let count = 0;



  for (let y = startY; y < startY + regionHeight; y++) {

    for (let x = startX; x < startX + regionWidth; x++) {

      const idx = (y * width + x) * 4;

      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      sum += brightness;

      sumSquares += brightness * brightness;

      count++;

    }

  }



  const mean = sum / count;

  const variance = sumSquares / count - mean * mean;



  return { mean, variance };

}



function getPatchStats(imageData: ImageData, centerX: number, centerY: number, radius: number) {

  const { data, width, height } = imageData;

  let sum = 0;

  let sumSquares = 0;

  let edges = 0;

  let count = 0;



  for (let y = Math.max(0, centerY - radius); y <= Math.min(height - 1, centerY + radius); y++) {

    for (let x = Math.max(0, centerX - radius); x <= Math.min(width - 1, centerX + radius); x++) {

      const idx = (y * width + x) * 4;

      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      sum += brightness;

      sumSquares += brightness * brightness;

      count++;



      if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {

        const center = data[idx];

        const right = data[(y * width + (x + 1)) * 4];

        const down = data[((y + 1) * width + x) * 4];

        if (Math.abs(center - right) + Math.abs(center - down) > 35) {

          edges++;

        }

      }

    }

  }



  const mean = count > 0 ? sum / count : 0;

  const variance = count > 0 ? sumSquares / count - mean * mean : 0;

  const edgeDensity = count > 0 ? edges / count : 0;



  return { mean, variance, edgeDensity };

}



function scalePoint(point: { x: number; y: number }, scale: number) {

  return {

    x: Math.round(point.x * scale),

    y: Math.round(point.y * scale)

  };

}



function checkEyeLandmarkGeometry(features: FaceFeaturePoints, scale: number) {

  const leftEye = scalePoint(features.leftEye, scale);

  const rightEye = scalePoint(features.rightEye, scale);

  const noseTip = scalePoint(features.noseTip, scale);

  const chin = scalePoint(features.chin, scale);



  const eyeDistance = Math.abs(rightEye.x - leftEye.x);

  const faceHeight = Math.max(1, chin.y - noseTip.y);

  const eyeLineY = (leftEye.y + rightEye.y) / 2;

  const eyeDistanceRatio = eyeDistance / faceHeight;



  return eyeLineY < noseTip.y && eyeDistanceRatio >= 0.3 && eyeDistanceRatio <= 1.5;

}

