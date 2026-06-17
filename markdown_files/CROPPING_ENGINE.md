# PassportAI Cropping Engine

## Purpose

The cropping engine converts a user selfie into a document-ready photo using the selected country/document template. It must be data-driven, deterministic, and explainable.

## Inputs

```ts
type CropInput = {
  sourceImage: HTMLImageElement | ImageBitmap;
  backgroundRemovedImage?: HTMLImageElement | ImageBitmap;
  template: DocumentTemplate;
  faceBox: FaceBox;
  landmarks: FaceLandmarks;
};
```

## Output

```ts
type CropOutput = {
  image: Blob;
  canvas: HTMLCanvasElement;
  widthPx: number;
  heightPx: number;
  cropBox: CropBox;
  headRatio: number;
};
```

## Dimension Conversion

Convert millimeters to pixels:

```text
pixels = round((mm / 25.4) * dpi)
```

Example for India Passport:

```text
35 mm x 45 mm at 300 DPI
width = round((35 / 25.4) * 300) = 413 px
height = round((45 / 25.4) * 300) = 531 px
```

## Crop Algorithm

1. Load selected template.
2. Compute final output width and height in pixels.
3. Detect face box and landmarks.
4. Estimate head bounds using landmarks and face box.
5. Compute current head ratio.
6. Compute target scale so head ratio falls near the middle of template range.
7. Position face center on target canvas center.
8. Keep eye line in a natural upper-middle position.
9. Compose image onto final canvas.
10. Fill background with template-defined color.
11. Export final image.

## Head Ratio

Head ratio means estimated head height divided by final image height.

```text
headRatio = headHeightPx / outputHeightPx * 100
```

For templates with:

```json
{
  "head_ratio_min": 70,
  "head_ratio_max": 80
}
```

Target the midpoint:

```text
targetHeadRatio = 75
```

## Face Positioning

Use normalized target positions:

```text
targetFaceCenterX = 0.5 * outputWidth
targetEyeLineY = 0.42 * outputHeight
```

Template overrides may adjust these values if specific countries require different composition.

## Background Handling

For MVP:

- Remove.bg returns a transparent or cutout image.
- Crop engine places subject on template background color.
- Most supported documents use white or off-white backgrounds.

Template field:

```json
{
  "background": "white"
}
```

Future values can include:

- white
- off_white
- light_gray
- blue
- custom hex

## Edge Cases

### Face Too Close

If the crop cannot fit the full head and shoulders:

- Generate best effort output.
- Mark head size check as warning or fail.
- Suggest moving farther from camera.

### Face Too Far

If scaling up would reduce quality:

- Generate output if possible.
- Mark resolution/head-size checks.
- Suggest uploading a closer, higher-resolution image.

### Multiple Faces

Do not guess. Use the largest face for preview only if necessary, but compliance should fail multiple faces.

### No Face

Stop processing and show a recoverable error.

## Manual Adjustment Optional

If time allows Wednesday:

- Add simple zoom and vertical position controls.
- Re-run compliance after adjustment.
- Keep automatic crop as the default.

## Crop Engine Contract

The crop engine must not contain country-specific branches such as:

```text
if country === "India"
```

All country-specific behavior must come from the template.

