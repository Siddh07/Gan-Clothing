"use client";

// The architectural multi-column footer is mounted directly in RootLayout via GlobalShell.
// This component returns null to prevent duplicate footers on pages that import Footer.
export function Footer() {
  return null;
}
