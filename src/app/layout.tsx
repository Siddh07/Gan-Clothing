import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QuoteCartProvider } from "@/context/QuoteCartContext";
import { QuoteCartDrawer } from "@/components/public/QuoteCartDrawer";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "GAN Trade Platform | Garment Association of Nepal",
    template: "%s | GAN Trade Platform",
  },
  description:
    "B2B procurement and operations platform for Nepalese garment manufacturers. Manage products, orders, buyers, and trade inquiries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8F8F6] text-[#1A1A1A] antialiased">
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
