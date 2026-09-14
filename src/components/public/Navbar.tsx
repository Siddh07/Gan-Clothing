"use client";

// The global navigation and operational ticker are mounted directly in RootLayout via GlobalShell.
// This component returns null to prevent duplicate headers on pages that import Navbar.
export function Navbar() {
  return null;
}
