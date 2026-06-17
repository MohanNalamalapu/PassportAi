# RUNBOOK.md - PassportAI Operations Guide

**Last Updated**: 2026-06-17  
**Version**: 1.0  
**Status**: Production Ready

---

## TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Required API Keys & Environment Variables](#required-api-keys--environment-variables)
3. [Installation Steps](#installation-steps)
4. [Local Development](#local-development)
5. [Build & Deployment](#build--deployment)
6. [Docker Operations](#docker-operations)
7. [Vercel Deployment](#vercel-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)

---

## QUICK START

### To run PassportAI locally:

```bash
# 1. Clone the repository
git clone <repository-url>
cd PassportAI

# 2. Install dependencies
npm install

# 3. Create environment configuration
cp .env.example .env.local

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:3000
```

**That's it!** The application will be running locally.

---

## REQUIRED API KEYS & ENVIRONMENT VARIABLES

### Environment Variables Configuration

Create a `.env.local` file in the project root with:

```env
# ============================================
# REQUIRED: Remove.bg API Key (Server-side)
# Get from: https://www.remove.bg/api
# ============================================
REMOVE_BG_API_KEY=your-remove-bg-api-key-here

# ============================================
# Public: Application URL
# Change for production deployments
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# Public: Maximum upload size in MB
# ============================================
NEXT_PUBLIC_MAX_UPLOAD_MB=10

# ============================================
# Server-only: Maximum upload size in MB
# (Server-side validation)
# ============================================
MAX_UPLOAD_MB=10
```

### Getting API Keys

#### Remove.bg API Key
1. Go to https://www.remove.bg/api
2. Sign up for a free account
3. Go to API section
4. Copy your API key
5. Paste into `REMOVE_BG_API_KEY` in `.env.local`

**Note**: Free tier includes 50 API calls/month. Paid plans available for production use.

### Environment Variable Reference

| Variable | Scope | Default | Description |
|----------|-------|---------|-------------|
| `REMOVE_BG_API_KEY` | Server | Required | API key for Remove.bg background removal |
| `NEXT_PUBLIC_APP_URL` | Public | http://localhost:3000 | Application URL (for links/redirects) |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | Public | 10 | Client-side max upload size display |
| `MAX_UPLOAD_MB` | Server | 10 | Server-side max upload size enforcement |
| `NODE_ENV` | System | development | Node environment (auto-set by scripts) |
| `NEXT_TELEMETRY_DISABLED` | System | 1 | Disable Next.js telemetry collection |

---

## INSTALLATION STEPS

### Prerequisites

- **Node.js**: 18.x or higher (20.x recommended)
- **npm**: 10.x or higher
- **Git**: Latest version
- **Remove.bg API Key**: Free or paid account

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd PassportAI
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output**:
```
added 374 packages, and audited 374 packages in 5s
```

### Step 3: Create Environment File

```bash
# Copy example to local configuration
cp .env.example .env.local
```

Edit `.env.local` and add your Remove.bg API key:

```env
REMOVE_BG_API_KEY=your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_UPLOAD_MB=10
MAX_UPLOAD_MB=10
```

### Step 4: Verify Installation

```bash
# Type check (verify no TypeScript errors)
npm run typecheck

# Lint check (verify code quality)
npm run lint

# Build check (verify production build)
npm run build
```

**Expected**: All commands complete successfully with no errors.

### Step 5: Clean Up (Optional)

```bash
# Remove build artifacts to start fresh
rm -rf .next
rm -rf node_modules
npm install
```

---

## LOCAL DEVELOPMENT

### Starting Development Server

```bash
npm run dev
```

**Expected Output**:
```
> passportai@0.1.0 dev
> next dev

  ▲ Next.js 15.5.19
  - Environments: .env.local
  - Local: http://localhost:3000

 ✓ Ready in 1.2s
```

### Accessing the Application

- **Landing**: http://localhost:3000
- **Upload**: http://localhost:3000/upload
- **Results**: http://localhost:3000/results
- **API Endpoints**:
  - GET `/api/templates` - List all templates
  - POST `/api/upload` - Upload an image
  - POST `/api/remove-background` - Remove background

### Development Features

#### Hot Reload
- Changes to `.tsx`, `.ts`, `.css` files automatically reload
- No need to restart server for most changes

#### Debug Logs
- Open browser DevTools (F12)
- Console tab shows detailed processing logs
- Network tab shows API calls

#### TypeScript IntelliSense
- Full IDE support in VS Code
- Hover over variables for type information
- Errors highlighted in editor

### Common Development Commands

```bash
# Development server
npm run dev

# Type check only (no build)
npm run typecheck

# Lint check
npm run lint

# Format code (if configured)
npm run format

# Build for production
npm run build

# Start production server
npm start
```

---

## BUILD & DEPLOYMENT

### Production Build

```bash
npm run build
```

**Output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (9/9)
✓ Finalizing page optimization

Route (app)                              Size  First Load JS
┌ ○ /                                 4.16 kB         119 kB
├ ○ /_not-found                         994 B         103 kB
├ ƒ /api/remove-background             134 B         103 kB
├ ƒ /api/templates                     134 B         103 kB
└ ƒ /upload                            238 kB         353 kB
```

### Verifying Production Build

```bash
# Check build artifacts
ls -la .next/
ls -la .next/static/

# Expected structure:
# .next/
# ├── static/          - JavaScript, CSS, fonts
# ├── server/          - Server-side code
# ├── cache/           - Build cache
# └── ...
```

### Starting Production Server

```bash
# Using Next.js built-in server
npm start

# Or manually with node
node .next/standalone/server.js
```

**Expected**: Application available at http://localhost:3000

### Build Troubleshooting

#### Build fails with TypeScript errors

```bash
npm run typecheck
# Fix errors shown in output
```

#### Build fails with memory issues

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

#### Build cache issues

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

---

## DOCKER OPERATIONS

### Docker Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker running and accessible
- Required environment variables prepared

### Building Docker Image

```bash
# Build image (tag as passportai:latest)
docker build -t passportai:latest .

# Build with specific version tag
docker build -t passportai:1.0 .

# Build with multiple tags
docker build -t passportai:latest -t passportai:1.0 .
```

**Build Time**: ~2-3 minutes (first build)

### Running Docker Container

```bash
# Run with environment file
docker run --env-file .env.local -p 3000:3000 passportai:latest

# Run with inline environment variables
docker run \
  -e REMOVE_BG_API_KEY=your-key-here \
  -e NEXT_PUBLIC_APP_URL=https://passportai.example.com \
  -p 3000:3000 \
  passportai:latest

# Run in background (detached mode)
docker run -d \
  --name passportai-app \
  --env-file .env.local \
  -p 3000:3000 \
  passportai:latest
```

### Docker Compose (Optional)

Create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  passportai:
    build: .
    ports:
      - "3000:3000"
    environment:
      REMOVE_BG_API_KEY: ${REMOVE_BG_API_KEY}
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      MAX_UPLOAD_MB: 10
      NEXT_PUBLIC_MAX_UPLOAD_MB: 10
    volumes:
      - .:/app  # For development
```

Then run:

```bash
docker-compose up
```

### Common Docker Commands

```bash
# List running containers
docker ps

# View container logs
docker logs passportai-app

# Follow logs in real-time
docker logs -f passportai-app

# Stop container
docker stop passportai-app

# Remove container
docker rm passportai-app

# Remove image
docker rmi passportai:latest

# Inspect container
docker inspect passportai-app

# Execute command in container
docker exec -it passportai-app sh
```

### Docker Troubleshooting

#### Port already in use

```bash
# Use different port
docker run -p 8000:3000 passportai:latest

# Find process using port 3000 (macOS/Linux)
lsof -i :3000

# Find process using port 3000 (Windows PowerShell)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Get-Process
```

#### Container exits immediately

```bash
# Check logs for errors
docker logs <container-name>

# Verify environment variables
docker run --env-file .env.local passportai:latest
```

#### Build fails

```bash
# Clean Docker cache
docker system prune

# Rebuild without cache
docker build --no-cache -t passportai:latest .
```

---

## VERCEL DEPLOYMENT

### Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub repository (public or private)
- Git repository configured

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Specify environment variables when prompted
# Or use vercel env add for each variable
vercel env add REMOVE_BG_API_KEY
```

### Option 2: Deploy via GitHub Integration

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import GitHub repository
4. Vercel auto-detects Next.js
5. Set environment variables in "Environment Variables" section:
   - `REMOVE_BG_API_KEY` = your-key-here
   - `NEXT_PUBLIC_APP_URL` = https://your-deployment.vercel.app

### Option 3: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your Git repository
4. Configure project:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables
6. Deploy

### Environment Variables in Vercel

1. Go to project settings
2. Click "Environment Variables"
3. Add each variable:
   - **Name**: `REMOVE_BG_API_KEY`
   - **Value**: your-api-key
   - **Environments**: Production, Preview, Development

### Vercel Deployment Monitoring

```bash
# View deployments
vercel list

# Check deployment logs
vercel logs <deployment-url>

# Promote preview to production
vercel promote <deployment-url>
```

### Custom Domain (Optional)

1. In Vercel project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records per instructions

### Performance Monitoring

- Vercel provides built-in analytics
- Check Speed Insights tab in project
- Monitor API usage in project analytics

### Rollback if Needed

```bash
# Find previous deployment
vercel list

# Promote previous deployment to production
vercel promote <previous-deployment-url>
```

---

## TROUBLESHOOTING

### Common Issues and Solutions

#### Application won't start

**Symptom**: `npm run dev` fails or shows errors

**Solution**:
```bash
# 1. Check Node version
node --version  # Should be 18+ (20+ recommended)

# 2. Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# 3. Check .env.local exists and is valid
cat .env.local

# 4. Check port 3000 is available
# On macOS/Linux: lsof -i :3000
# On Windows: netstat -ano | findstr :3000

# 5. Try building first
npm run build
```

#### Remove.bg API fails

**Symptom**: Background removal returns 401 error

**Solution**:
```bash
# 1. Verify API key is correct
echo $REMOVE_BG_API_KEY  # Should print your key (not empty)

# 2. Check API key format
# Should be a long alphanumeric string

# 3. Verify key is in .env.local
grep REMOVE_BG_API_KEY .env.local

# 4. Check Remove.bg quota
# Visit https://www.remove.bg/api

# 5. Test API directly
curl -X POST https://api.remove.bg/v1.0/removebg \
  -H "X-Api-Key: your-key-here" \
  -F "image_file=@test.jpg" \
  -F "size=auto" > result.png
```

#### Upload fails

**Symptom**: Upload endpoint returns 400 or 413 error

**Solution**:
```bash
# 1. Verify file is JPEG or PNG
file your-image.jpg

# 2. Check file size
ls -lh your-image.jpg  # Should be < 10MB

# 3. Verify upload size limit in .env.local
grep MAX_UPLOAD_MB .env.local

# 4. Test upload via API
curl -X POST http://localhost:3000/api/upload \
  -F "file=@your-image.jpg"
```

#### Face detection not working

**Symptom**: Face detection fails in browser console

**Solution**:
```
1. Check browser console (F12)
2. Verify MediaPipe CDN is accessible:
   - https://cdn.jsdelivr.net/npm/@mediapipe/face_detection
   - https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh

3. Check internet connection (MediaPipe loads from CDN)

4. Try different image with clear face

5. Verify image isn't too small (min 100x100px recommended)
```

#### TypeScript errors in development

**Symptom**: Red squiggles in IDE but `npm run typecheck` passes

**Solution**:
```bash
# 1. Reload VS Code
# Command Palette > Developer: Reload Window

# 2. Restart TypeScript server
# Command Palette > TypeScript: Restart TS Server

# 3. Check tsconfig.json
cat tsconfig.json

# 4. Clear TypeScript cache
rm tsconfig.tsbuildinfo
```

#### Build fails with "Cannot find module"

**Symptom**: `npm run build` fails with module not found

**Solution**:
```bash
# 1. Verify all imports are correct
grep -r "from.*@/" src/  # Check for invalid paths

# 2. Check tsconfig paths
grep paths tsconfig.json

# 3. Reinstall dependencies
npm install

# 4. Clear build cache
rm -rf .next
npm run build
```

---

## MONITORING & LOGGING

### Application Logs

#### Development Logs

```bash
# Logs appear in terminal running npm run dev
# Shows all requests and errors
```

#### Production Logs

```bash
# Start production server
npm start

# Logs go to stdout (capture with process manager)
# Example with PM2:
pm2 start "npm start" --name passportai --output logs/out.log --error logs/error.log
```

#### Docker Logs

```bash
# View logs from container
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>

# View last 100 lines
docker logs --tail 100 <container-id>
```

### Monitoring Checklist

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Set up performance monitoring (Vercel Speed Insights)
- [ ] Set up log aggregation (e.g., Logtail, DataDog)
- [ ] Set up alerts for errors and downtime
- [ ] Monitor API rate limits (Remove.bg)
- [ ] Monitor disk space usage
- [ ] Monitor memory usage

### Example: Adding Sentry (Optional)

```bash
npm install @sentry/nextjs

# Add to app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## BACKUP & RECOVERY

### What to Backup

- `.env.local` (environment variables)
- `data/passport-templates.json` (if customized)
- Custom configuration files
- Custom components (if any)

### Backup Script

```bash
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup environment
cp .env.local $BACKUP_DIR/

# Backup data
cp -r data/ $BACKUP_DIR/

# Backup any custom code
cp -r src/custom/ $BACKUP_DIR/ 2>/dev/null || true

echo "Backup created at $BACKUP_DIR"
```

### Recovery Steps

1. Stop the application
2. Restore backup files to project root
3. Verify `.env.local` is correct
4. Restart the application
5. Test all functionality

### Disaster Recovery

**If application is down**:

```bash
# 1. Check logs
npm start 2>&1 | head -50

# 2. Verify environment
cat .env.local

# 3. Check Remove.bg API status
curl -I https://api.remove.bg/v1.0/removebg

# 4. Verify disk space
df -h

# 5. Verify Node version
node --version

# 6. Try fresh install
rm -rf node_modules
npm install
npm run build
npm start
```

---

## MAINTENANCE SCHEDULE

### Daily
- Monitor error logs
- Check Remove.bg API quota
- Verify application is responding

### Weekly
- Review performance metrics
- Check for dependency updates
- Test backup restoration

### Monthly
- Update dependencies: `npm update`
- Review and rotate API keys if needed
- Archive old logs
- Update documentation

### Quarterly
- Major dependency updates: `npm upgrade`
- Security audit: `npm audit`
- Performance optimization review
- Feature planning

---

## SUPPORT & ESCALATION

### Emergency Contacts

- **Application Down**: Check Docker status, check logs, restart if needed
- **API Key Issues**: Verify key in `.env.local`, check Remove.bg account status
- **Performance Issues**: Check CPU/memory usage, check Remove.bg API status

### Getting Help

1. Check logs: `docker logs passportai-app`
2. Check environment: `cat .env.local`
3. Run typecheck: `npm run typecheck`
4. Test API: `curl http://localhost:3000/api/templates`
5. Check Remove.bg: `https://www.remove.bg/api`

---

## APPENDIX: QUICK REFERENCE

### Essential Commands

```bash
# Install & Setup
npm install
cp .env.example .env.local  # Edit with API key
npm run build

# Development
npm run dev                  # Start dev server
npm run typecheck            # Type checking
npm run lint                 # Code quality

# Production
npm start                    # Start prod server
npm run build               # Build for prod

# Docker
docker build -t passportai:latest .
docker run --env-file .env.local -p 3000:3000 passportai:latest

# Vercel
vercel login
vercel
```

### Environment Variables

```env
REMOVE_BG_API_KEY=your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_UPLOAD_MB=10
NEXT_PUBLIC_MAX_UPLOAD_MB=10
```

### API Endpoints

```
GET  /                         # Landing page
GET  /upload                   # Upload page
GET  /results                  # Results page
GET  /api/templates            # All templates
GET  /api/templates/[id]       # Template by ID
POST /api/upload               # Upload image
GET  /api/upload/[fileId]      # Get upload
POST /api/remove-background    # Remove background
```

### Important Files

- `.env.local` - Environment configuration
- `next.config.ts` - Next.js configuration
- `src/services/` - Business logic
- `components/` - React components
- `app/api/` - API routes

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-17  
**Status**: Ready for Production
