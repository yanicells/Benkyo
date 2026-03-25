import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Noto_Sans_JP,
  Noto_Serif_JP,
} from "next/font/google";
import { PwaInit } from "../components/shared/pwa-init";
import "./globals.css";

const serifDisplay = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodySans = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
});

const japaneseDisplay = Noto_Serif_JP({
  variable: "--font-japanese-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://benkyo.ycells.com"),
  applicationName: "Benkyo",
  title: {
    default: "Benky\u014d",
    template: "%s | Benky\u014d",
  },
  description:
    "Benky\u014d is a fast Japanese study app for lesson decks and kana practice.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Benkyo",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Benky\u014d",
    description:
      "A personal Japanese study app for lesson decks, kana drills, and focused repetition.",
    url: "https://benkyo.ycells.com",
    siteName: "Benky\u014d",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Benky\u014d",
    description:
      "A personal Japanese study app for lesson decks, kana drills, and focused repetition.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7efe4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serifDisplay.variable} ${bodySans.variable} ${japaneseDisplay.variable} antialiased`}
      >
        <PwaInit />
        {children}
      </body>
    </html>
  );
}
