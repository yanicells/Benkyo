import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Noto_Sans_JP,
  Noto_Serif_JP,
} from "next/font/google";
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
  title: {
    default: "Benky\u014d",
    template: "%s | Benky\u014d",
  },
  description:
    "Benky\u014d is a fast Japanese study app for lesson decks and kana practice.",
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
        {children}
      </body>
    </html>
  );
}
