import type { NextConfig } from "next";

function getR2ImageHostnames() {
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!publicUrl) {
    return [{ protocol: "https" as const, hostname: "**.r2.dev" }];
  }

  try {
    const hostname = new URL(publicUrl).hostname;
    return [{ protocol: "https" as const, hostname }];
  } catch {
    return [{ protocol: "https" as const, hostname: "**.r2.dev" }];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getR2ImageHostnames(),
  },
};

export default nextConfig;
