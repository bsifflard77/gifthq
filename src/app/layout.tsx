import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GiftHQ - Your Gift Command Center",
  description: "Plan gifts, track budgets, share wish lists — and never buy a duplicate gift again. Christmas, birthdays, weddings, all in one place.",
  keywords: ["gift tracking", "christmas gifts", "birthday gifts", "gift planner", "wish list", "budget tracker", "gift ideas"],
  manifest: "/manifest.json",
  openGraph: {
    title: "GiftHQ - Your Gift Command Center",
    description: "Plan gifts, track budgets, share wish lists. Never buy a duplicate gift again.",
    type: "website",
    url: "https://gifthq.ai",
    images: ["/og-image-v4.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiftHQ - Your Gift Command Center",
    description: "Plan gifts, track budgets, share wish lists. Never buy a duplicate gift again.",
    images: ["/og-image-v4.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GiftHQ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3D4F5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="impact-site-verification" content="13bb6bc7-95af-491c-8a04-1c186b53e605" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
