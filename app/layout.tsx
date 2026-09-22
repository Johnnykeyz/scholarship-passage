import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://passage.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Passage — Your journey to global education, organized",
  description:
    "Discover scholarships, universities, and research opportunities. Track requirements, documents and deadlines for every application in one place.",
  icons: {
    icon: [{ url: "/passage.png", type: "image/png" }],
    shortcut: ["/passage.png"],
    apple: [{ url: "/passage.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Passage",
    title: "Passage — Prepare properly for your next opportunity",
    description:
      "Discover opportunities, understand requirements, and track your scholarship readiness from one trusted workspace.",
    url: siteUrl,
    images: [{ url: "/passage.png", width: 1200, height: 630, alt: "Passage scholarship readiness platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Passage — Prepare properly for your next opportunity",
    description:
      "A clearer way to discover, prepare for, and track scholarship applications.",
    images: ["/passage.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10233f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
