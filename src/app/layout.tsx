import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ConsentBanner } from "@/components/ConsentBanner";

// Polices auto-hébergées via next/font : plus aucune requête vers Google
// Fonts au premier affichage (vie privée + performance, pas de CSS bloquante).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OOPSQR",
  url: siteUrl,
  inLanguage: "fr",
  description:
    "Crée gratuitement un QR code qui révèle une blague, une image ou un message secret après le scan.",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  alternates: { canonical: "/" },
  title: {
    default: "OOPSQR — Le QR code qui cache une surprise",
    template: "%s · OOPSQR",
  },
  description:
    "Crée gratuitement un QR code qui révèle une blague, une image ou un message secret après le scan. Sans inscription, prêt en 10 secondes.",
  applicationName: "OOPSQR",
  icons: {
    icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "OOPSQR",
    title: "OOPSQR — Le QR code qui cache une surprise",
    description:
      "Une blague, un message secret ou une image cachée derrière un QR code. Gratuit, sans compte, en 10 secondes.",
    images: [{ url: "/brand/logo.png", width: 800, height: 800, alt: "OOPSQR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OOPSQR — Le QR code qui cache une surprise",
    description: "Crée un QR code surprise gratuitement, sans inscription.",
  },
};

export const viewport: Viewport = {
  themeColor: "#17151F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {children}
        <ConsentBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
