import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import "./globals.css";

// Self-hosted variable font (offline-safe — no build-time Google Fonts fetch).
// Exposed as --font-sans; swap the file here to change the product typeface.
const sans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
  description: "AI-driven, multi-tenant helpdesk.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shell = (
    <html lang="en" className={sans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );

  // Wrap in ClerkProvider only when Clerk is configured, so the app still
  // renders as a static design with placeholder/empty keys.
  return isClerkConfigured ? <ClerkProvider>{shell}</ClerkProvider> : shell;
}
