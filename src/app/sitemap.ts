import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Dynamic sitemap for the GAN B2B Export Portal.
 *
 * Priority hierarchy:
 *  1.0  — Homepage (weekly)
 *  0.9  — Directory index (daily — new factories added frequently)
 *  0.8  — Product catalog index (daily)
 *  0.8  — Individual enterprise profiles (weekly + lastModified)
 *  0.7  — Individual product pages (weekly + lastModified)
 *  0.6  — RFQ / Request a Quote
 *  0.5  — Institutional pages (monthly)
 *
 * Note: /about is excluded until the page is implemented.
 * Note: Admin, portal, and API routes are excluded (see robots.ts).
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rfq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    // Only approved enterprises are publicly accessible
    const enterprises = await prisma.enterprise.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    // All published products (no draft state in current schema)
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const enterpriseRoutes: MetadataRoute.Sitemap = enterprises.map((item) => ({
      url: `${baseUrl}/directory/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.map((item) => ({
      url: `${baseUrl}/products/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...enterpriseRoutes, ...productRoutes];
  } catch {
    // Graceful degradation: return static routes if DB is unavailable
    return staticRoutes;
  }
}
