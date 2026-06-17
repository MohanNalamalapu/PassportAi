# Operational Runbook - PassportAI

**Status**: Demo-ready / MVP deployed. Needs production hardening before real users.

## Local Development Setup

To run PassportAI locally for demonstration or testing:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Set your Remove.bg API key in `.env.local`:
   ```env
   REMOVE_BG_API_KEY=your_remove_bg_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 in your browser.

## Deployment & Environments

- **Hosting**: The application is configured to run on Render or Vercel.
- **Docker**: Docker support is not currently included.
- **Upload Limit**: Configurable via environment variables (`MAX_UPLOAD_MB` and `NEXT_PUBLIC_MAX_UPLOAD_MB`). Default is set to 5MB but may vary by deployment.
- **MediaPipe assets**: Served locally from `/public/mediapipe/` to avoid external CDN dependencies.
- **Privacy**: No database persistence is used. Processed results are stored only in the browser's `sessionStorage` for the current tab/session.
