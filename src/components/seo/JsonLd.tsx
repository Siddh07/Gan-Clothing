import React from "react";

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string;
  description: string;
  address?: string;
  email?: string;
  telephone?: string;
}

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
    logo: logo || "https://ganepal.org/logo.png",
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  images: string[];
  manufacturerName: string;
  categoryName: string;
  sku: string;
}

export function ProductJsonLd({
  name,
  description,
  images,
  manufacturerName,
  categoryName,
  sku,
}: ProductJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images.length > 0 ? images : undefined,
    sku,
    category: categoryName,
    manufacturer: {
      "@type": "Organization",
      name: manufacturerName,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      price: "RFQ",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
