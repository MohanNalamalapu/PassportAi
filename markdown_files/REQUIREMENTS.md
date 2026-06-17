# PassportAI Requirements

## Functional Requirements

### Landing And Education

- Show a premium landing page with concise value proposition.
- Include features section.
- Include how-it-works section.
- Include entry point to country selector and upload flow.
- Use responsive mobile-first layout.

### Country Selector

- Load supported document templates from JSON.
- Allow searching or filtering by country.
- Show country, document type, required size, background, and DPI.
- Persist selected template in browser state or local storage.

### Upload

- Accept JPEG and PNG uploads.
- Enforce file size limit, recommended max 10 MB.
- Validate image resolution before processing.
- Show image preview.
- Show clear error messages for unsupported or invalid files.

### Processing

- Remove background through Remove.bg API.
- Detect face and landmarks using MediaPipe Face Detection and Face Mesh.
- Use OpenCV for image measurements, sharpness, brightness, and composition support.
- Use selected JSON template for crop dimensions and compliance thresholds.
- Generate final image at required aspect ratio and DPI metadata where supported.

### Compliance

Implement only these 10 checks for V1:

1. Face centered.
2. Eyes visible.
3. Head size valid.
4. Plain background.
5. No multiple faces.
6. Brightness acceptable.
7. Sharpness acceptable.
8. No sunglasses detected.
9. Looking straight at camera.
10. Resolution sufficient.

Each check must return:

- id
- label
- status: pass, warning, or fail
- score impact
- measured value when useful
- explanation
- suggestion

### Results

- Show before/after comparison.
- Show selected template summary.
- Show compliance score out of 100.
- Show pass/warning/fail result.
- Show detailed compliance report.
- Show suggested fixes.
- Provide download buttons for JPEG, PNG, and PDF.

### Export

- JPEG export with white or template-defined background.
- PNG export with final flattened background.
- PDF export using pdf-lib with correct physical dimensions.

## Non-Functional Requirements

### Performance

- Target total processing time below 15 seconds.
- Client-side interactions should feel immediate.
- Large images should be resized before processing where possible.

### Reliability

- Handle API failures with retry and clear messaging.
- Never expose Remove.bg API key to the browser.
- Validate inputs on both client and API route.

### Security

- No database in V1.
- No persistent uploaded-image storage.
- Images should be processed transiently.
- Environment variables must be server-only where sensitive.
- Validate image MIME type and file size.

### Scalability

- JSON templates should support adding new countries without changing crop/compliance code.
- API routes should be stateless.
- Processing pipeline should be separable into queue/job flow later.
- Storage abstraction should allow future S3/R2 integration.

### Accessibility

- Use semantic HTML.
- Provide keyboard-accessible upload and controls.
- Ensure color contrast for statuses.
- Do not rely on color alone for compliance status.

### Browser Support

- Latest Chrome, Edge, Safari, and Firefox.
- Mobile Safari and Chrome for upload flow.

## Supported Documents For MVP

Minimum set:

- India Passport
- India Visa
- USA Passport
- USA Visa
- UK Passport
- UK Visa
- Canada Passport
- Australia Passport
- Germany Passport
- France Passport
- Italy Passport
- Spain Passport
- Netherlands Passport
- Ireland Passport
- New Zealand Passport
- Singapore Passport
- Japan Passport
- South Korea Passport
- China Passport
- UAE Passport
- Saudi Arabia Passport
- Schengen Visa

## Acceptance Criteria

- A new template can be added to JSON and used without editing the crop engine.
- Uploading a valid selfie produces an output image.
- Compliance report displays all 10 checks.
- Download buttons generate files.
- Vercel deployment works with documented environment variables.
- Docker build strategy is documented and runnable.

