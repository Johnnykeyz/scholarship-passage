import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents the site being framed by another origin (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Blocks MIME-sniffing away from a declared content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limits how much referrer info leaks to other origins on navigation.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Opts out of unneeded browser features this app never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
