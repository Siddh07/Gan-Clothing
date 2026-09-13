import { MetadataRoute } from "next";

/**
 * Crawler directives for the GAN B2B Export Portal.
 *
 * Allowed public routes:
 *   /            — Homepage
 *   /directory/* — Factory profiles
 *   /products/*  — Product catalog
 *   /rfq         — Request for Quote form
 *
 * Disallowed (private / admin / API):
 *   /admin/      — Admin CMS dashboard
 *   /portal/     — Factory rep portal
 *   /api/        — REST API endpoints
 *   /auth/       — Authentication pages (NextAuth routes)
 *   /apply/      — Factory application form (pre-approval only)
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/directory/", "/products/", "/rfq"],
        disallow: ["/admin/", "/portal/", "/api/", "/auth/", "/apply/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
