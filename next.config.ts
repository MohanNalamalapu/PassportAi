import type { NextConfig } from "next";
import { cpSync, existsSync } from "fs";
import { join } from "path";

// Copy animation.jpg to public folder so it's accessible by the client
const srcPath = join(process.cwd(), "animation.jpg");
const destPath = join(process.cwd(), "public", "animation.jpg");
if (existsSync(srcPath)) {
  try {
    cpSync(srcPath, destPath);
  } catch (error) {
    console.error("Failed to copy animation.jpg to public directory:", error);
  }
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  devIndicators: false
};

export default nextConfig;
