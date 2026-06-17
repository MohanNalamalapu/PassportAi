export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  maxUploadMb: Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 10)
};

