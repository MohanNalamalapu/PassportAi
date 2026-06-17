export interface NormalizedPoint {
  x: number;
  y: number;
  z: number;
}

export interface ImagePoint {
  x: number;
  y: number;
  z: number;
}

export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export interface FaceFeaturePoints {
  leftEye: ImagePoint;
  rightEye: ImagePoint;
  noseTip: ImagePoint;
  chin: ImagePoint;
  forehead: ImagePoint;
}

export interface FaceDetectionResult {
  faceCount: number;
  boundingBox: FaceBoundingBox;
  landmarks: ImagePoint[];
  features: FaceFeaturePoints;
  sourceWidth: number;
  sourceHeight: number;
}

export interface PassportCropResult {
  sourceCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputWidth: number;
  outputHeight: number;
  headRatio: number;
  centeredAt: {
    x: number;
    y: number;
  };
}
