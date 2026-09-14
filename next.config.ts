import type { NextConfig } from "next";

/**
 * Content Security Policy for the GAN B2B Export Portal.
 *
 * Directives explained:
 *  - default-src 'self'           → baseline: only same-origin
 *  - script-src 'unsafe-inline'   → required for Next.js inline scripts & JSON-LD <script> tags
 *  - img-src data: https:         → Cloudinary, Unsplash CDN, and data URIs for previews
 *  - connect-src                  → API calls + Cloudflare Turnstile challenge endpoint
 *  - frame-src                    → Cloudflare Turnstile iframe widget
 *  - frame-ancestors 'none'       → equivalent to X-Frame-Options: DENY
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Prevent clickjacking (belt-and-suspenders alongside frame-ancestors 'none')
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Control referrer header leakage
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Restrict browser feature APIs (camera, mic, geolocation unused)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Force HTTPS for 2 years with subdomains; add to HSTS preload list when ready
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Full Content Security Policy
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  // Disable cross-origin embedder / opener policy as platform embeds Cloudinary resources
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
