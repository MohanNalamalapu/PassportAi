export const serverEnv = {
  removeBgApiKey: process.env.REMOVE_BG_API_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? 10)
};

export function requireServerEnv(name: keyof typeof serverEnv): string {
  const value = serverEnv[name];

  if (!value || typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

