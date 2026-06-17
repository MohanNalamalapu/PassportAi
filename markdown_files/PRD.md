# PassportAI PRD

## Product Summary

PassportAI is a production-quality AI passport photo generator for a founder demo. A user uploads a selfie, chooses a country and document type, and receives a passport-ready image with automated background removal, face-aware cropping, compliance scoring, and downloadable JPEG, PNG, and PDF outputs.

The product goal is not to prove a full startup model. The goal is to demonstrate strong product judgment, AI/CV integration, deployment readiness, scalable architecture, and the ability to ship a polished website quickly.

## Demo Objective

By Thursday morning, the product should convincingly show:

- A complete web workflow from upload to download.
- Country/document templates loaded dynamically from JSON.
- AI-assisted photo processing under a target of 15 seconds.
- A transparent compliance report with score, pass/warning/fail checks, and suggestions.
- A polished UI suitable for a founder presentation.
- A deployable Vercel-ready codebase with Docker support and clear scaling path.

## Target Users

- Travelers applying for passports or visas.
- Students and workers preparing visa application photos.
- Admins or support teams who need quick document photo preparation.
- Founder/demo audience evaluating product and engineering quality.

## Primary User Journey

1. User lands on the site and understands the value quickly.
2. User selects country and document type.
3. User uploads a selfie.
4. System previews original image and begins processing.
5. Background is removed or normalized.
6. Face landmarks are detected.
7. Template rules are loaded dynamically.
8. Image is cropped and composed to target dimensions.
9. Compliance engine evaluates the output.
10. User sees before/after comparison, score, checks, suggestions, and downloads.

## Success Criteria

- Upload-to-result flow works end to end.
- At least 20 country/document templates are available.
- Cropping and compliance logic are template-driven.
- Compliance report includes exactly 10 MVP checks.
- User can download JPEG, PNG, and PDF.
- Website is responsive and visually polished.
- App can be deployed to Vercel.
- No database is required for V1.

## Non-Goals For V1

- User accounts.
- Payments.
- Persistent cloud storage.
- Admin dashboard.
- Human review workflow.
- Guaranteed legal acceptance for every issuing authority.
- Batch processing.
- Native mobile apps.

## Core Features

### Country And Document Selection

Users can choose a supported country/document type before upload. The selected template controls output size, background requirements, DPI, head ratio, and compliance thresholds.

### Image Upload

Users upload one image from desktop or mobile. MVP accepts JPEG and PNG. Client-side validation checks file type, size, and rough resolution before processing.

### AI Photo Processing

The system removes the background, detects face landmarks, crops the image according to the selected template, and produces a compliant output canvas.

### Compliance Report

The system runs 10 checks and generates:

- Overall score out of 100.
- PASS, WARNING, or FAIL status.
- Per-check result.
- User-friendly suggestions.

### Downloads

Users can download:

- JPEG for application portals.
- PNG for lossless digital use.
- PDF for printing.

## MVP Performance Target

- Target: complete output in under 15 seconds.
- Acceptable demo fallback: show staged progress and complete within 20 seconds for large images.
- Client should show meaningful loading states for upload, background removal, face detection, cropping, compliance checks, and export generation.

## Risks

- Remove.bg latency or API quota issues.
- Browser MediaPipe compatibility differences.
- Selfie quality variation.
- Exact government rules can vary and change.
- PDF print dimensions must be carefully handled.

## Risk Mitigations

- Provide graceful error states and retry.
- Use template-based thresholds instead of hardcoded country logic.
- Keep local preview and client-side processing fast.
- Offer suggestions when the image cannot pass.
- Add demo-safe sample images for presentation.

