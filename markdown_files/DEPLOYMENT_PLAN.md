# Deployment Plan

PassportAI is designed to run locally or hosted in cloud platforms (Render/Vercel). Docker support is not currently included.

## 1. Local Development
For local testing and design work:
```bash
# Clone the repository
npm install

# Start the dev server
npm run dev
```
Open `http://localhost:3000` to preview the app.

## 2. Production Hosting (Render)
When deploying the app to Render:
1.  Connect your GitHub repository.
2.  Set the **Build Command** to `npm run build`.
3.  Set the **Start Command** to `npm run start`.
4.  Set the **Environment Variables**:
    *   `REMOVE_BG_API_KEY`: The API key from Remove.bg.
    *   `NEXT_PUBLIC_APP_URL`: The URL of your hosted service.
    *   `MAX_UPLOAD_MB`: The file size limit in MB (default: 5).
    *   `NODE_VERSION`: `20` (Render node setting).
