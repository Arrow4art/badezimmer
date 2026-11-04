import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Backdrop } from "@/components/backdrop";
import { CartProvider } from "@/components/cart-context";
import { ConsentBanner } from "@/components/consent-banner";
import { Footer } from "@/components/footer";
import { GoogleAdsTag } from "@/components/google-ads-tag";
import { Header } from "@/components/header";
import { getCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Pilands Cards — Sealed Booster Displays, Boxes & Decks",
    template: "%s · Pilands Cards",
  },
  description:
    "Sealed booster displays, Elite Trainer Boxes and decks. Prices in USD, free US shipping, free 14-day returns and secure card payment through Stripe.",
  robots:
    process.env.ALLOW_INDEXING === "false"
      ? { index: false, follow: false }
      : { index: true, follow: true },
  openGraph: {
    title: "Pilands Cards",
    description: "Sealed booster displays, Elite Trainer Boxes and decks.",
    locale: "en_US",
    type: "website",
    images: ["/images/hero-sortiment.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#0A0716" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <html lang="en-US">
      <body className={`${outfit.className} bg-night text-ink antialiased`}>
        <Backdrop />
        <GoogleAdsTag />
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <CartProvider>
          <Header
            searchItems={catalog.products.map((product) => ({
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              kind: product.targetUse,
              priceCents: product.priceCents,
            }))}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "OnlineStore",
                name: "Pilands Cards",
                url: siteUrl(),
                email: catalog.business.email,
                ...(catalog.business.phone ? { telephone: catalog.business.phone } : {}),
                address: {
                  "@type": "PostalAddress",
                  streetAddress: catalog.business.street,
                  postalCode: catalog.business.zip,
                  addressLocality: catalog.business.city,
                  addressRegion: catalog.business.state,
                  addressCountry: "US",
                },
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "US",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 14,
                  returnMethod: "https://schema.org/ReturnByMail",
                  returnFees: "https://schema.org/FreeReturn",
                  refundType: "https://schema.org/FullRefund",
                  merchantReturnLink: `${siteUrl()}/returns`,
                },
              }),
            }}
          />
          <main id="inhalt">{children}</main>
          <Footer
            business={catalog.business}
            checkoutMode={catalog.checkoutMode}
            shipping={catalog.shipping}
          />
          <ConsentBanner />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
