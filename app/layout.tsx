import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { CartProvider } from "@/components/cart-context";
import { Footer } from "@/components/footer";
import { GoogleAdsTag } from "@/components/google-ads-tag";
import { Header } from "@/components/header";
import { getCatalog } from "@/lib/catalog";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Badezimmer — Mini-Saunen für zu Hause",
    template: "%s · Badezimmer",
  },
  description:
    "Kompakte Mini-Saunen für zu Hause. Sechs Modelle, Preise in Euro inklusive Mehrwertsteuer, Versand innerhalb Deutschlands.",
  robots:
    process.env.ALLOW_INDEXING === "true"
      ? { index: true, follow: true }
      : { index: false, follow: false },
  openGraph: {
    title: "Badezimmer",
    description: "Deine persönliche Wellness-Oase für zu Hause.",
    locale: "de_DE",
    type: "website",
    images: ["/images/hero-wellness-oase.webp"],
  },
};

export const viewport: Viewport = { themeColor: "#F3EEE6" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <html lang="de">
      <body className={`${outfit.className} bg-cream text-ink antialiased`}>
        <GoogleAdsTag />
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
        >
          Zum Inhalt
        </a>
        <CartProvider>
          <Header />
          <main id="inhalt">{children}</main>
          <Footer business={catalog.business} />
        </CartProvider>
      </body>
    </html>
  );
}
