/**
 * src/components/seo/JsonLd.tsx
 *
 * Enterprise Schema.org JSON-LD component library for the
 * Garment Association of Nepal (GAN) B2B Export Portal.
 *
 * Supported schemas:
 *  - WebSiteJsonLd         → Portal-level WebSite + SearchAction
 *  - GanOrganizationJsonLd → GAN as NGO with ILO funder
 *  - EnterpriseJsonLd      → Individual factory as LocalBusiness/Organization
 *  - ProductJsonLd         → Garment product with AggregateOffer
 *  - BreadcrumbJsonLd      → BreadcrumbList for all sub-pages
 */

import React from "react";

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function JsonLdScript({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}

// ---------------------------------------------------------------------------
// WebSite + SearchAction  (inject in layout.tsx)
// ---------------------------------------------------------------------------

interface WebSiteJsonLdProps {
  url: string;
  name: string;
  description: string;
}

export function WebSiteJsonLd({ url, name, description }: WebSiteJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/directory?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLdScript schema={schema} />;
}

// ---------------------------------------------------------------------------
// GAN Organization / NGO  (inject in layout.tsx)
// ---------------------------------------------------------------------------

export function GanOrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "NGO"],
    "@id": "https://ganb2b.org.np/#organization",
    name: "Garment Association of Nepal (GAN)",
    alternateName: "GAN",
    url: "https://ganb2b.org.np",
    logo: {
      "@type": "ImageObject",
      url: "https://ganb2b.org.np/logo.png",
      width: 256,
      height: 256,
    },
    description:
      "Apex trade organization and official registry of verified Nepalese ready-made garment and textile exporters. Supported by the International Labour Organization (ILO) LDC Graduation Project.",
    foundingDate: "1986",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sankhamul",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
      postalCode: "44600",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Export Trade Desk",
        email: "ganasso2011@gmail.com",
        availableLanguage: ["English", "Nepali"],
      },
    ],
    sameAs: ["https://www.facebook.com/GANNepal"],
    funder: {
      "@type": "Organization",
      name: "International Labour Organization (ILO)",
      url: "https://www.ilo.org",
    },
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    knowsAbout: [
      "Ready-Made Garments",
      "Apparel Export",
      "Nepal Trade",
      "LDC Graduation",
      "Sustainable Fashion",
      "FOB Sourcing",
    ],
  };

  return <JsonLdScript schema={schema} />;
}

// ---------------------------------------------------------------------------
// Enterprise / LocalBusiness  (inject in /directory/[slug])
// ---------------------------------------------------------------------------

interface CertificationItem {
  name: string;
  issuer?: string;
}

interface EnterpriseJsonLdProps {
  name: string;
  slug: string;
  url: string;
  logo?: string | null;
  description: string;
  address: string;
  city: string;
  email: string;
  telephone: string;
  websiteUrl?: string | null;
  certifications: CertificationItem[];
  monthlyCapacityPcs: number;
  isVerified: boolean;
  yearEstablished: number;
}

export function EnterpriseJsonLd({
  name,
  slug,
  url,
  logo,
  description,
  address,
  city,
  email,
  telephone,
  websiteUrl,
  certifications,
  monthlyCapacityPcs,
  isVerified,
  yearEstablished,
}: EnterpriseJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${url}/directory/${slug}#enterprise`,
    name,
    url: websiteUrl || `${url}/directory/${slug}`,
    image: logo || undefined,
    description,
    foundingDate: String(yearEstablished),
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressCountry: "NP",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Export Inquiries",
      email,
      telephone,
    },
    knowsAbout: certifications.map((c) => c.name),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${name} Export Product Catalog`,
      description: `Verified export-grade garments produced at ${monthlyCapacityPcs.toLocaleString()} pcs/month capacity.`,
    },
    memberOf: {
      "@type": "Organization",
      name: "Garment Association of Nepal (GAN)",
      "@id": "https://ganb2b.org.np/#organization",
    },
    ...(isVerified && {
      award: "GAN Verified Exporter",
    }),
  };

  return <JsonLdScript schema={schema} />;
}

// ---------------------------------------------------------------------------
// Legacy alias — keeps older imports working without breaking change
// ---------------------------------------------------------------------------

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string;
  description: string;
  address?: string;
  email?: string;
  telephone?: string;
}

/**
 * @deprecated Use EnterpriseJsonLd for enterprise detail pages,
 *             or GanOrganizationJsonLd for portal-level schema.
 */
export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
  address,
  email,
  telephone,
}: OrganizationJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: logo || "https://ganb2b.org.np/logo.png",
    description,
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: address,
          addressCountry: "NP",
        }
      : undefined,
    contactPoint: email
      ? {
          "@type": "ContactPoint",
          contactType: "Export Trade Desk",
          email,
          telephone,
        }
      : undefined,
  };

  return <JsonLdScript schema={schema} />;
}

// ---------------------------------------------------------------------------
// Product  (inject in /products/[slug])
// ---------------------------------------------------------------------------

interface ProductJsonLdProps {
  name: string;
  description: string;
  images: string[];
  manufacturerName: string;
  manufacturerSlug: string;
  categoryName: string;
  sku: string;
  fabricType: string;
  gsmWeight?: number | null;
  moq: number;
  baseUrl: string;
}

export function ProductJsonLd({
  name,
  description,
  images,
  manufacturerName,
  manufacturerSlug,
  categoryName,
  sku,
  fabricType,
  gsmWeight,
  moq,
  baseUrl,
}: ProductJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images.length > 0 ? images : undefined,
    sku,
    category: categoryName,
    material: gsmWeight ? `${fabricType}, ${gsmWeight} GSM` : fabricType,
    brand: {
      "@type": "Brand",
      name: manufacturerName,
      url: `${baseUrl}/directory/${manufacturerSlug}`,
    },
    manufacturer: {
      "@type": "Organization",
      name: manufacturerName,
      url: `${baseUrl}/directory/${manufacturerSlug}`,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      offerCount: 1,
      lowPrice: moq,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: manufacturerName,
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Minimum Order Quantity",
        value: `${moq.toLocaleString()} pieces`,
      },
      {
        "@type": "PropertyValue",
        name: "Incoterms",
        value: "FOB Tribhuvan / CIF Kolkata Seaport",
      },
    ],
  };

  return <JsonLdScript schema={schema} />;
}

// ---------------------------------------------------------------------------
// BreadcrumbList  (inject on all sub-pages)
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript schema={schema} />;
}
