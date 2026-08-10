import type { Metadata } from "next";

import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/siteUrl";

import "./globals.css";

// Self-hosted by next/font at build time — no external request, no FOUT, and
// no layout shift from a late-arriving webfont.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Love Story Atelier — couture bridal veils, made in Brisbane",
    template: "%s · Love Story Atelier",
  },
  description:
    "Couture bridal veils and accessories, handmade to order in Brisbane " +
    "from European tulle. Custom embroidery and heirloom finishing.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: site.name,
    title: "Love Story Atelier — couture bridal veils, made in Brisbane",
    description:
      "Handmade to order from European tulle. Cathedral, chapel, fingertip " +
      "and mantilla veils, drafted to your gown.",
    images: [{ url: "/images/ls-hero.webp", width: 1600, height: 2400 }],
  },
  twitter: { card: "summary_large_image" },
};

// LocalBusiness rather than Organization: a Brisbane studio with appointment
// visits. Only facts stated in the source theme are asserted — no ratings, no
// price range, no opening hours, because the source states none.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  email: site.email,
  url: siteUrl(),
  address: {
    "@type": "PostalAddress",
    addressLocality: site.locality,
    addressRegion: site.region,
    addressCountry: "AU",
  },
  founder: { "@type": "Person", name: site.founder },
  makesOffer: {
    "@type": "Offer",
    itemOffered: { "@type": "Product", name: "Made-to-order bridal veils" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
