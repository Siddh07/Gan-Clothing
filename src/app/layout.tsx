import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QuoteCartProvider } from "@/context/QuoteCartContext";
import { QuoteCartDrawer } from "@/components/public/QuoteCartDrawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Garment Association of Nepal (GAN) | B2B Export Directory & Sourcing Portal",
    template: "%s | Garment Association of Nepal (GAN)",
  },
  description:
    "Official B2B Export Portal for the Garment Association of Nepal. Discover verified garment manufacturers, cashmere artisans, woven mills, and export-compliant factories.",
  keywords: [
    "Garment Association of Nepal",
    "GAN Nepal",
    "Nepal Garment Export",
    "Nepal Apparel Manufacturer",
    "Himalayan Cashmere",
    "Nepal Textile Sourcing",
    "B2B Garment Directory",
    "Ethical Apparel Nepal",
  ],
  openGraph: {
    title: "Garment Association of Nepal (GAN) | B2B Export Directory",
    description: "Official B2B platform connecting global apparel buyers with verified Nepalese garment exporters.",
    siteName: "Garment Association of Nepal",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <AuthProvider>
          <QuoteCartProvider>
            {children}
            <QuoteCartDrawer />
          </QuoteCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
