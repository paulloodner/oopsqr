import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConsentBanner } from "@/components/ConsentBanner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
