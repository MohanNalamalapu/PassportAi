# PassportAI

PassportAI is an AI-assisted passport photo generator. Users select a country/document template, upload a selfie, and receive a compliant passport photo with background removal, face-aware cropping, compliance scoring, and multi-format export.

## Features

- Next.js 15 App Router with TypeScript and Tailwind CSS
- 22 passport/visa templates across 19 countries (JSON-driven)
- Drag-and-drop upload with client and server validation
- Remove.bg background removal (server-side API key protection)
- MediaPipe face detection and landmark-based cropping (served locally from `public/mediapipe`, no CDN required)
- 10-check compliance engine (head ratio, centering, brightness, sharpness, pose, eyes, sunglasses, background, resolution, single face)
- Export to JPEG, PNG, and PDF
- Functional `/results` page with session-based result persistence
- Vitest unit tests and GitHub Actions CI

## Routes

```text
/                      Landing page
/upload                Country selector and full processing workflow
/results               Download page with preview and compliance summary
/api/templates         Template catalog API
/api/templates/[id]    Single template API
/api/upload            Server upload validation (optional API)
/api/remove-background Remove.bg integration
```

## Project Structure

```text
app/                   Next.js App Router pages and API routes
components/            UI components (upload, results, shared, ui)
src/services/          Business logic (crop, compliance, export, templates)
src/lib/               Browser utilities (face detection, image analysis)
lib/                   Env config, storage helpers, re-exports
data/                  passport-templates.json
```

## Environment Variables

Create `.env.local` from `.env.example`:

```text
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_UPLOAD_MB=10
MAX_UPLOAD_MB=10
```

Notes:

- `REMOVE_BG_API_KEY` is required for background removal.
- Uploaded images are not persisted to a database in V1.
- Processing results are stored in browser sessionStorage only.

## Local Development

```bash
npm install
npm run dev
```

MediaPipe assets are copied to `public/mediapipe` automatically on install/dev. If face detection fails, run:

```bash
npm run prepare:mediapipe
```

Open `http://localhost:3000`

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Docker

Docker support is available but requires additional configuration (`output: "standalone"` in `next.config.ts`). See `RUNBOOK.md` for deployment notes.

## Privacy

- Template selection persists in localStorage.
- Uploaded photos stay in browser memory during processing.
- Background removal sends the image to Remove.bg server-side.
- No database storage of user photos in V1.
