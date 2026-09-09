import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QuoteCartProvider } from "@/context/QuoteCartContext";
import { QuoteCartDrawer } from "@/components/public/QuoteCartDrawer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Garment Association of Nepal (GAN) | Procurement & Export Portal",
    template: "%s | Garment Association of Nepal",
  },
  description:
    "Official B2B procurement and operations console of the Garment Association of Nepal. Audited member mills, technical production specifications, and trade inquiries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F6F7F8] text-[#0D0D0D] selection:bg-[#1E3A52]/15 selection:text-[#0D0D0D]">
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
