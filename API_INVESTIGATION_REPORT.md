# API Investigation Report: Background Removal Failure

This report documents the root-cause analysis of the background removal failure in the PassportAI application.

## 1. Provider Used
- **Provider**: [Remove.bg](https://www.remove.bg/)

## 2. API Endpoint Called
- **Endpoint**: `https://api.remove.bg/v1.0/removebg` (POST)
- **Account Verification Endpoint**: `https://api.remove.bg/v1.0/account` (GET)

## 3. Environment Variable Required
- **Variable**: `REMOVE_BG_API_KEY` (Server-only environment variable, loaded from `.env.local` at startup)

## 4. Current Implementation Summary
The integration follows this execution path:
1. **Frontend**: The `UploadExperience` component ([UploadExperience.tsx](file:///d:/projects/PassportAI/components/upload/UploadExperience.tsx#L93)) invokes the server API route via a POST request:
   ```javascript
   fetch("/api/remove-background", { method: "POST", body: form })
   ```
2. **API Route**: The API endpoint `app/api/remove-background/route.ts` ([route.ts](file:///d:/projects/PassportAI/app/api/remove-background/route.ts#L55)) processes the multipart form data, extracts the image buffer and template details, and delegates to the service layer:
   ```typescript
   const result = await removeBackground({ imageBuffer, fileName, mimeType, template });
   ```
3. **Service Layer**: The `removeBackground` function in `src/services/background-removal.ts` ([background-removal.ts](file:///d:/projects/PassportAI/src/services/background-removal.ts#L72)) retrieves the API key:
   - Resolves the API key via `requireServerEnv("removeBgApiKey")` (mapped to `process.env.REMOVE_BG_API_KEY` in [env.ts](file:///d:/projects/PassportAI/lib/env.ts)).
   - Performs a POST request to `https://api.remove.bg/v1.0/removebg` with the key set in the `X-Api-Key` header.
   - If the request fails, it throws a `BackgroundRemovalServiceError` with code `BACKGROUND_REMOVAL_FAILED` containing the HTTP status and response error message.

## 5. Exact Error Received
- **HTTP Status Code**: `402 Payment Required`
- **Error Message**: `Remove.bg request failed (402): Insufficient credits`

## 6. Root Cause Analysis
We performed an inspection and programmatic check on the API keys configured in the workspace:

| Location | Key Value | Account API Credits / Free Calls Remaining | Status |
| :--- | :--- | :--- | :--- |
| `.env.local` | **0** credits, **0** free calls remaining | ❌ **Exhausted / Insufficient Funds** |
| `.env.example` | **0** credits, **50** free calls remaining |  **Active / Working** |

- The active API key loaded by Next.js from `.env.local` has **zero credits** remaining.
- The example key in `.env.example` has **50 free calls remaining** and is active.
- Since `.env.local` overrides `.env.example` in Next.js, the exhausted key was actively used by the server, leading to the `402 Payment Required` failure.

## 7. Recommended Fix
Since this is an **environment and billing/quota issue**, the following actions are recommended:

1. **Immediate Workaround**: Swap the exhausted key in `.env.local` with the working key from `.env.example` to restore application functionality:
   ```env
   REMOVE_BG_API_KEY="yDEbJKACyDgtVKErTJ81qDCC"
   ```
2. **Long-Term Action**: Purchase additional credits or sign up for a new Remove.bg account to generate a new API key, and configure it under `REMOVE_BG_API_KEY` in `.env.local`.
