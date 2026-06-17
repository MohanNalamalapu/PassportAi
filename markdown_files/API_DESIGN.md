# PassportAI API Design

## API Principles

- API routes are stateless.
- Sensitive keys stay server-side.
- Inputs are validated at the boundary.
- Errors are normalized for the UI.
- Routes are designed so heavier processing can move to workers later.

## Environment Variables

```text
REMOVE_BG_API_KEY=server-only Remove.bg API key
NEXT_PUBLIC_APP_URL=public app URL
MAX_UPLOAD_MB=optional upload limit, default 10
NODE_ENV=development|production
```

Only variables prefixed with `NEXT_PUBLIC_` may be exposed to the browser.

## POST /api/remove-background

Removes or normalizes the image background through Remove.bg.

### Request

Content type: multipart/form-data

Fields:

- image: uploaded JPEG or PNG
- templateId: selected document template id

### Response

```json
{
  "success": true,
  "image": {
    "mimeType": "image/png",
    "base64": "..."
  },
  "provider": "remove-bg",
  "durationMs": 2400
}
```

### Errors

```json
{
  "success": false,
  "error": {
    "code": "BACKGROUND_REMOVAL_FAILED",
    "message": "We could not remove the background. Please try another photo."
  }
}
```

## POST /api/process

Runs the full image processing pipeline. For V1, this may coordinate server and client outputs depending on MediaPipe/OpenCV placement.

### Request

```json
{
  "templateId": "india_passport",
  "image": {
    "mimeType": "image/png",
    "base64": "..."
  }
}
```

### Response

```json
{
  "success": true,
  "template": {
    "id": "india_passport",
    "country": "India",
    "document": "Passport",
    "width_mm": 35,
    "height_mm": 45,
    "dpi": 300
  },
  "result": {
    "mimeType": "image/png",
    "base64": "...",
    "widthPx": 413,
    "heightPx": 531
  },
  "metrics": {
    "faceCount": 1,
    "headRatio": 74,
    "brightness": 0.62,
    "sharpness": 0.71,
    "yaw": 1.8,
    "pitch": -0.6,
    "roll": 0.9
  },
  "compliance": {
    "score": 92,
    "status": "pass",
    "checks": []
  },
  "durationMs": 6100
}
```

## POST /api/export/pdf

Generates a PDF from the processed image.

### Request

```json
{
  "templateId": "india_passport",
  "image": {
    "mimeType": "image/png",
    "base64": "..."
  },
  "layout": "single"
}
```

### Response

Binary PDF response:

```text
Content-Type: application/pdf
Content-Disposition: attachment; filename="passportai-india-passport.pdf"
```

## Client-Side Download APIs

JPEG and PNG can be generated in the browser from the final canvas:

- canvas.toBlob("image/jpeg", 0.95)
- canvas.toBlob("image/png")

PDF can be generated server-side or client-side with pdf-lib. Server route is preferred for consistency and future print-layout control.

## Error Codes

```text
INVALID_FILE_TYPE
FILE_TOO_LARGE
TEMPLATE_NOT_FOUND
BACKGROUND_REMOVAL_FAILED
FACE_NOT_FOUND
MULTIPLE_FACES_DETECTED
LANDMARK_DETECTION_FAILED
CROP_FAILED
COMPLIANCE_FAILED
EXPORT_FAILED
RATE_LIMITED
UNKNOWN_ERROR
```

## API Validation Rules

- Accept only image/jpeg and image/png.
- Reject files above configured size limit.
- Require a valid templateId.
- Limit base64 payload size.
- Strip EXIF metadata where possible.
- Never log full image payloads.

## Future API Evolution

When scaling beyond demo:

- `POST /api/jobs` to create processing jobs.
- `GET /api/jobs/:id` to poll status.
- Object storage for temporary inputs and outputs.
- Queue worker for CPU-heavy OpenCV operations.
- Rate limits by IP or authenticated user.

