# PassportAI Deployment Plan

## Deployment Target

Primary target: Vercel.

Vercel is the right default for the demo because it supports Next.js directly, manages preview deployments, handles serverless API routes, and keeps deployment fast.

## Required Environment Variables

```text
REMOVE_BG_API_KEY=your_remove_bg_key
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
MAX_UPLOAD_MB=10
```

Rules:

- `REMOVE_BG_API_KEY` must only be used in server routes.
- `.env.local` is for local development and must not be committed.
- Vercel project settings store production and preview values.

## Local Development

Expected commands:

```text
npm install
npm run dev
```

Local app URL:

```text
http://localhost:3000
```

## Vercel Deployment Steps

1. Push repository to GitHub.
2. Import repository into Vercel.
3. Select Next.js framework preset.
4. Add environment variables.
5. Deploy preview branch.
6. Validate upload, processing, compliance, and downloads.
7. Promote stable deployment to production.

## Build Validation

Run before deployment:

```text
npm run lint
npm run typecheck
npm run build
```

## Docker Strategy

Docker is included to demonstrate deployment readiness and portability, even if Vercel is the primary host.

### Dockerfile Strategy

- Use Node 20 Alpine base image.
- Install dependencies with npm ci.
- Build Next.js app.
- Run production server.
- Keep image lean with multi-stage build.

Expected files:

```text
Dockerfile
.dockerignore
docker-compose.yml
```

### docker-compose Strategy

Use docker-compose for local production-like verification:

```text
services:
  passportai:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
```

## Scaling Preparation

V1 is stateless and database-free. That is intentional.

When traffic grows:

1. Add temporary object storage.
   - S3, Cloudflare R2, or Vercel Blob.
2. Add async processing.
   - Queue uploads and process in workers.
3. Move CPU-heavy CV work.
   - Dedicated worker service for OpenCV.
4. Add persistence.
   - Database only for accounts, history, payments, or audit trails.
5. Add rate limiting.
   - Protect Remove.bg costs and API routes.
6. Add observability.
   - Track processing time, failure reasons, and provider latency.

## Production Concerns

### API Limits

Remove.bg can be a bottleneck because it has cost, latency, and quota constraints. Add usage limits before public launch.

### File Size

Limit upload size and resize images client-side where possible.

### Privacy

Uploaded photos are sensitive. V1 should avoid storing them permanently. Clearly communicate that images are processed for generation and not saved in a database.

### Compliance Disclaimer

The app should state that rules are best-effort and users should verify with official government requirements.

## Wednesday Deployment Checklist

- Vercel production URL works.
- Environment variables are configured.
- Remove.bg route works in production.
- Upload flow works on desktop and mobile.
- JPEG download works.
- PNG download works.
- PDF download works.
- Compliance report renders all 10 checks.
- Error states are presentable.
- Demo sample image is ready.
- Docker build strategy is documented.

## Founder Demo Runbook

1. Open production URL.
2. Show landing page and explain product promise.
3. Select a country/document template.
4. Upload prepared sample selfie.
5. Narrate AI pipeline stages.
6. Show before/after result.
7. Explain compliance score and suggestions.
8. Download JPEG, PNG, and PDF.
9. Briefly show architecture and scaling plan.

