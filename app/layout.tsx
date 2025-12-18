import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "O2Paris - Carte Sonore Interactive",
  description: "Découvrez les sons de l'eau à Paris avec O2Paris, une carte sonore interactive et immersive.",
  keywords: ["Eau de Paris", "Carte sonore", "Paris", "Sons", "Interactif", "Map"],
  authors: [{ name: "O2Paris Team" }],
  openGraph: {
    title: "O2Paris - Carte Sonore Interactive",
    description: "Plongez dans l'ambiance sonore des points d'eau parisiens.",
    url: "https://o2paris.vercel.app",
    siteName: "O2Paris",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "O2Paris - Carte Sonore Interactive",
    description: "Découvrez les sons de l'eau à Paris.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💧</text></svg>",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2196F3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
