# PassportAI Compliance Engine

## Purpose

The compliance engine evaluates whether the generated photo is likely to satisfy the selected document template. It is not a legal guarantee. It gives a transparent quality score, check-level results, and user suggestions.

## Inputs

```ts
type ComplianceInput = {
  template: DocumentTemplate;
  image: ProcessedImage;
  metrics: VisionMetrics;
};
```

## Outputs

```ts
type ComplianceReport = {
  score: number;
  status: "pass" | "warning" | "fail";
  checks: ComplianceCheck[];
  suggestions: string[];
};

type ComplianceCheck = {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  points: number;
  maxPoints: number;
  measured?: number | string;
  explanation: string;
  suggestion?: string;
};
```

## Scoring Model

Use 10 checks worth 10 points each.

- pass: full 10 points
- warning: 5 to 8 points depending on severity
- fail: 0 points

Overall status:

- pass: score >= 85 and no critical failures
- warning: score >= 70 or only non-critical failures
- fail: score < 70 or any critical failure

Critical failures:

- No face detected.
- Multiple faces detected.
- Resolution insufficient.
- Head size invalid by a large margin.

## MVP Checks

### 1. Face Centered

Uses face bounding box center compared with image center.

Pass:

- Horizontal and vertical center offset within template tolerance.

Warning:

- Slightly outside tolerance.

Fail:

- Face clearly off-center.

Suggestion:

- "Move your face to the center of the frame."

### 2. Eyes Visible

Uses Face Mesh eye landmarks and confidence.

Pass:

- Both eyes detected and unobstructed.

Warning:

- One eye confidence is low.

Fail:

- Eyes are closed, hidden, or not detected.

Suggestion:

- "Use a front-facing photo with both eyes open and visible."

### 3. Head Size Valid

Measures head height as a percentage of final image height.

Pass:

- Ratio falls between template head_ratio_min and head_ratio_max.

Warning:

- Ratio is near boundary.

Fail:

- Head is too small or too large.

Suggestion:

- "Move closer to the camera" or "Move slightly farther from the camera."

### 4. Plain Background

Measures background consistency after removal/fill.

Pass:

- Background matches template requirement.

Warning:

- Minor shadows or artifacts.

Fail:

- Strong patterns, transparency, or uneven background.

Suggestion:

- "Use a plain wall or improve lighting before uploading."

### 5. No Multiple Faces

Uses MediaPipe face count.

Pass:

- Exactly one face detected.

Fail:

- Zero or multiple faces.

Suggestion:

- "Upload a photo with only one person visible."

### 6. Brightness Acceptable

Uses average luminance and histogram distribution.

Pass:

- Brightness is within configured range.

Warning:

- Slight underexposure or overexposure.

Fail:

- Too dark or too bright.

Suggestion:

- "Use brighter, even lighting with no harsh shadows."

### 7. Sharpness Acceptable

Uses variance of Laplacian or equivalent OpenCV metric.

Pass:

- Sharpness above threshold.

Warning:

- Slight softness.

Fail:

- Blurry image.

Suggestion:

- "Retake the photo while holding the camera steady."

### 8. No Sunglasses Detected

V1 heuristic using eye-region darkness and landmark visibility.

Pass:

- Eye regions are visible and not unusually dark.

Warning:

- Possible tinted glasses.

Fail:

- Sunglasses likely.

Suggestion:

- "Remove sunglasses or tinted glasses and retake the photo."

### 9. Looking Straight At Camera

Uses head pose estimates from Face Mesh landmarks.

Pass:

- Yaw, pitch, and roll within acceptable thresholds.

Warning:

- Slight tilt.

Fail:

- Face turned or tilted too far.

Suggestion:

- "Look directly into the camera with your head straight."

### 10. Resolution Sufficient

Compares image dimensions with template-derived minimum output.

Pass:

- Source and output dimensions support required final size.

Warning:

- Barely above minimum.

Fail:

- Too low resolution.

Suggestion:

- "Upload a higher-resolution photo."

## Suggestion Prioritization

Show the most useful suggestions first:

1. Critical failures.
2. Failed checks.
3. Warnings.
4. Minor quality improvements.

Limit visible suggestions to 3 to 5 items for a clean UI.

## Template-Driven Thresholds

Templates can override:

- head_ratio_min
- head_ratio_max
- face_center_tolerance
- brightness_min
- brightness_max
- sharpness_min
- max_yaw
- max_pitch
- max_roll
- min_width_px
- min_height_px

If a value is missing, the engine uses safe defaults.

## Demo Strategy

Tune thresholds to be helpful but not brittle. The compliance engine should make the demo feel intelligent and explainable, not reject every reasonable selfie.

