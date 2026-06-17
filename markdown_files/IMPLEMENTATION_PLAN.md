# PassportAI Implementation Plan

## Delivery Strategy

The schedule is intentionally narrow. The build should prioritize an impressive, reliable, end-to-end demo over broad production features. The architecture should look scalable, but the implementation should stay MVP-focused.

## Monday: Foundation And Core Flow

### Morning

- Create Next.js 15 TypeScript app.
- Add TailwindCSS and shadcn/ui.
- Set up base layout, typography, theme tokens, and responsive shell.
- Create route structure:
  - /
  - /upload
  - /results
- Add document template JSON with at least 20 supported document types.
- Build template registry and schema validation.

### Afternoon

- Build landing page sections:
  - hero
  - features
  - how it works
  - country/document entry point
- Build country selector.
- Build upload dropzone.
- Add client-side file validation.
- Add local flow state.
- Implement Remove.bg API route.

### Evening

- Integrate MediaPipe face detection.
- Detect face count and basic face box.
- Create initial crop engine using template dimensions.
- Render before/after preview.
- Add basic JPEG and PNG download.

## Tuesday: AI/CV, Compliance, Results

### Morning

- Integrate Face Mesh landmarks.
- Improve crop algorithm using eye line, face bounds, and head ratio.
- Add OpenCV image metrics:
  - brightness
  - sharpness
  - resolution
  - background plainness support
- Implement compliance engine with 10 checks.

### Afternoon

- Build results page:
  - before/after comparison
  - compliance score
  - grouped pass/warning/fail checks
  - suggestions
  - template summary
  - download panel
- Add PDF generation with pdf-lib.
- Add loading states and staged processing timeline.
- Add graceful error states and retry.

### Evening

- Polish mobile responsiveness.
- Test with multiple sample selfies.
- Add sample demo images if allowed.
- Tune thresholds for demo reliability.
- Add README or presentation notes if time permits.

## Wednesday: Deployment, Scaling Prep, Polish

### Morning

- Configure Vercel deployment.
- Add environment variable documentation.
- Add Dockerfile and docker-compose strategy.
- Add production build validation.
- Add basic error logging.

### Afternoon

- Performance optimization:
  - resize large images before processing
  - lazy-load MediaPipe/OpenCV
  - optimize image payload sizes
- Add final UI animations and micro-interactions.
- Add presentation-safe fallback flow for API failures.
- Add deployment checklist.

### Evening

- Full demo rehearsal.
- Verify mobile and desktop.
- Verify downloads.
- Verify compliance report.
- Freeze scope.

## Thursday Morning: Presentation

- Use prepared sample image first.
- Then show live upload if network/API are stable.
- Highlight architecture:
  - JSON-driven templates
  - stateless API
  - AI/CV pipeline
  - compliance scoring
  - Vercel deployment path
- Discuss scaling path:
  - storage
  - queues
  - workers
  - monitoring
  - database only when product needs it

## Build Order

1. App shell and design system.
2. Template JSON and registry.
3. Country selector.
4. Upload flow.
5. Background removal API route.
6. Face detection.
7. Crop engine.
8. Results preview.
9. Compliance engine.
10. Downloads.
11. Deployment readiness.
12. Polish.

## Demo-Critical Features

These must work:

- Upload a selfie.
- Select a country/document.
- Generate a cropped passport-style result.
- Show compliance score and checks.
- Download JPEG, PNG, and PDF.

## Optional Features

Add only after the core flow is stable:

- Drag handle for manual crop adjustment.
- Multiple photo sheet layout for printing.
- Sample image mode.
- Simple history in local storage.
- Dark mode.
- More country templates.

## Engineering Principles

- Keep V1 stateless.
- Keep templates data-driven.
- Keep AI provider hidden behind adapters.
- Keep UI clean and predictable.
- Avoid adding a database before there is a real need.
- Prefer reliable demo behavior over overly ambitious automation.

