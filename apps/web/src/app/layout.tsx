import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
  title: "V.A.N.A — Vigilant Assistance for NER Areas | Smart Tourist Safety Portal",
  description: "V.A.N.A (Vigilant Assistance for NER Areas) — AI-powered travel companion and 4-step emergency safety net across Northeast India (Meghalaya, Sikkim).",
  keywords: "VANA, tourist safety, NER safety, travel companion, offline SOS, emergency, India, Meghalaya, Sikkim, smart tourism",
  authors: [{ name: "V.A.N.A Team" }],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
