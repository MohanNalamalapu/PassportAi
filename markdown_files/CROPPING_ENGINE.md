# Crop Engine

The crop engine derives the exact cropping coordinates needed to align the face, include shoulders, and format the photo for the document standard.

## Core Operations

1.  **Metric Conversion**: Converts the physical size of the document (in millimeters) into pixel output using the template DPI.
2.  **Landmark Extraction**: Extracts the chin point, eye midline, and crown (top of the head) to measure the raw face height.
3.  **Aspect Ratio Calculation**: Determines the target crop width and height strictly adhering to the output aspect ratio.
4.  **Unclamped Centering**: Position coordinates are centered directly around the face:
    *   `cropX = faceCenterX - cropWidth / 2`
    *   `cropY = idealTop`
5.  **Padding and Alignment**: If the centered crop box extends outside the source image bounds (e.g., if the face is close to the bottom/sides, or on landscape photos), coordinates are left unclamped. The canvas renderer draws the cropped content centered and pads out-of-bounds areas with a solid white background, keeping the face centered and showing shoulders.

## Outputs
Returns target crop dimensions `{ x, y, width, height }`, output pixel dimensions, calculated head ratio, and centering metrics.
