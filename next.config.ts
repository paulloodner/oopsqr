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
    // CSP en mode "report only" : on observe d'abord, pour ne casser ni la
    // régie publicitaire (Adsterra) ni les éventuels blocs AdSense futurs.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://bauval.org https://*.adsterra.com https://pagead2.googlesyndication.com https://*.highperformanceformat.com https://*.pubads.live",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-src https://bauval.org https://*.adsterra.com https://*.highperformanceformat.com https://*.pubads.live https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      "worker-src 'self' blob:",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
