import type { Metadata, Viewport } from "next";
import "./globals.css";
// import "leaflet/dist/leaflet.css"; // Leaflet no longer primary, but keeping for admin map or future use

export const metadata: Metadata = {
  title: "O2Paris - Expérience Visuelle & Sonore",
  description: "Une balade immersive à travers Paris.",
  keywords: ["Paris", "Photo", "Son", "Art", "Expérience"],
  authors: [{ name: "O2Paris Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
