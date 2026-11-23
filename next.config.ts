import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  webpack(config) {
    // Contournement d'un bug Windows/Node de cette machine : webpack appelle
    // readlink() sur des fichiers normaux et reçoit EISDIR.
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
