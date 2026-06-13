import type { Metadata } from "next";
import localFont from "next/font/local";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

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
  return (
    <html lang="en" className={sans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
