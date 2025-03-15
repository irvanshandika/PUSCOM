import { ThemeProvider } from "@/src/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: {
    default: "Pusat Komputer Terpercaya di Yogyakarta | PUSCOM",
    template: "%s | Jual Beli, Servis & Spare Part Komputer",
  },
  description: "Solusi Lengkap untuk Komputer & Laptop. Jual Beli, Servis Professional, dan Spare Part Berkualitas di Yogyakarta.",
  keywords: ["jual beli komputer", "laptop yogyakarta", "servis komputer", "spare part komputer", "toko komputer terpercaya", "toko laptop yogyakarta"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://puscom.web.id/",
    siteName: "PUSCOM",
    title: "Pusat Komputer Terpercaya di Yogyakarta - PUSCOM",
    description: "Solusi Lengkap untuk Komputer & Laptop di Yogyakarta",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/fd2b90ef-208d-4908-81c0-ce8212b4163f.jpg?token=i17BU4xK-7FMAJIuvxWzVRMZgCwp25b3O8nV64syks0&height=869&width=1200&expires=33268290034",
        width: 1200,
        height: 630,
        alt: "PUSCOM - Pusat Komputer Yogyakarta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PUSCOM - Pusat Komputer Terpercaya",
    description: "Jual Beli, Servis & Spare Part Komputer di Yogyakarta",
    images: ["https://opengraph.b-cdn.net/production/images/fd2b90ef-208d-4908-81c0-ce8212b4163f.jpg?token=i17BU4xK-7FMAJIuvxWzVRMZgCwp25b3O8nV64syks0&height=869&width=1200&expires=33268290034"],
  },
  alternates: {
    canonical: "https://puscom.web.id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="OJGaC9hOIiPX7zJ1nmCKlPbHQ656ytp6atR4V_F8obc" />
        <link rel="preload" href="https://use.typekit.net/hah7vzn.css" />
        <meta name="ahrefs-site-verification" content="56e3eacd6834c3da16a90f901d69046296782f47f3cb0a27b5c80cbbcdd8a2d1" />
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="AurRtBIx16qnfNxIz0ahVA" async></script>
      </head>
      <body className="antialiased font-adobe-clean">
        <Toaster position="top-right" />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-80DERZ2CNY" />
      </body>
    </html>
  );
}
