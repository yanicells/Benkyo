import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { PwaInit } from "../components/shared/pwa-init";
import { InstallBanner } from "../components/shared/install-banner";
import { UpdateToast } from "../components/shared/update-toast";
import { AuthProvider } from "../components/shared/auth-provider";
import { MigrationPrompt } from "../components/shared/migration-prompt";
import { TopAppBar } from "../components/shared/top-app-bar";
import { BottomNav } from "../components/shared/bottom-nav";
import { DesktopSidebar } from "../components/shared/desktop-sidebar";
import { DesktopHeader } from "../components/shared/desktop-header";
import { MobileLaunchSplash } from "../components/shared/mobile-launch-splash";
import { Footer } from "../components/shared/footer";
import "./globals.css";

const displayFont = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      { url: "/icon1-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon1-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon1-512.svg", type: "image/svg+xml" }],
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
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "Benky\u014d — Japanese Study App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Benky\u014d",
    description:
      "A personal Japanese study app for lesson decks, kana drills, and focused repetition.",
    images: ["/og_image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#002446",
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
        className={`${displayFont.variable} ${bodySans.variable} ${japaneseDisplay.variable} antialiased min-h-dvh bg-surface flex`}
      >
        <AuthProvider>
          <MobileLaunchSplash />
          <PwaInit />
          <InstallBanner />
          <UpdateToast />
          <MigrationPrompt />

          {/* Global Desktop Sidebar */}
          <div className="hidden lg:block shrink-0">
            <DesktopSidebar />
          </div>

          <div className="flex-1 flex flex-col min-h-screen min-w-0">
            {/* Desktop Header */}
            <div className="hidden lg:block sticky top-0 z-30">
              <DesktopHeader />
            </div>

            {/* Mobile Top App Bar */}
            <div className="lg:hidden sticky top-0 z-30">
              <TopAppBar />
            </div>

            {/* Main Content */}
            <main className="flex-1 pb-[env(safe-area-inset-bottom)] sm:pb-0 relative">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden relative z-40">
              <BottomNav />
            </div>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
