import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QuoteCartProvider } from "@/context/QuoteCartContext";
import { QuoteCartDrawer } from "@/components/public/QuoteCartDrawer";
import { GlobalShell } from "@/components/public/GlobalShell";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import { GanOrganizationJsonLd } from "@/components/seo/JsonLd";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ganb2b.org.np";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "Garment Association of Nepal (GAN) | Official B2B Sourcing Portal",
    template: "%s | Garment Association of Nepal (GAN)",
  },

  description:
    "The official B2B sourcing portal of the Garment Association of Nepal. Connect directly with 50+ verified RMG manufacturers. FOB Nepal pricing, 0% US import duty, ILO-supported LDC Graduation Project.",

  keywords: [
    "Nepal garment export",
    "Kathmandu apparel manufacturers",
    "FOB Nepal",
    "Nepal textile B2B",
    "ILO LDC Graduation Project",
    "WRAP certified Nepal",
    "RMG Nepal sourcing",
    "wholesale garment Nepal",
    "Nepal knitwear manufacturer",
    "Nepalese apparel factory",
    "GAN verified exporter",
    "OEKO-TEX Nepal",
    "ISO certified garment Nepal",
    "Nepal cashmere exporter",
    "Kathmandu fashion export",
  ],

  authors: [
    {
      name: "Garment Association of Nepal (GAN)",
      url: SITE_URL,
    },
  ],

  creator: "Garment Association of Nepal (GAN)",
  publisher: "Garment Association of Nepal (GAN)",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "GAN B2B Sourcing Portal",
    title:
      "Garment Association of Nepal (GAN) | Official B2B Sourcing Portal",
    description:
      "Source from verified Nepalese garment manufacturers. FOB Nepal, 0% US duty, ILO-supported LDC Graduation Project.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Garment Association of Nepal (GAN) – Official B2B Export Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@GANNepal",
    creator: "@GANNepal",
    title:
      "Garment Association of Nepal (GAN) | Official B2B Sourcing Portal",
    description:
      "Source from verified Nepalese garment manufacturers. FOB Nepal, 0% US duty, ILO LDC Graduation Project.",
    images: ["/og-default.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F2F2F2] text-[#231F20] antialiased">
        {/* Portal-level Schema.org JSON-LD */}
        <WebSiteJsonLd
          url={SITE_URL}
          name="Garment Association of Nepal (GAN) B2B Portal"
          description="Official B2B sourcing portal for verified Nepalese garment and apparel manufacturers."
        />
        <GanOrganizationJsonLd />

        <AuthProvider>
          <QuoteCartProvider>
            <GlobalShell>{children}</GlobalShell>
            <QuoteCartDrawer />
          </QuoteCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
