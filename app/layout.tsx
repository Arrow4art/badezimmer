import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
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
    default: "Iwoody — Displays, Boxen und Decks",
    template: "%s · Iwoody",
  },
  description:
    "Versiegelte Displays, Top-Trainer-Boxen und Decks. Preise inklusive 19 % MwSt., kostenloser Versand innerhalb Deutschlands, Zahlung per Karte über Stripe.",
  robots:
    process.env.ALLOW_INDEXING === "false"
      ? { index: false, follow: false }
      : { index: true, follow: true },
  openGraph: {
    title: "Iwoody",
    description: "Versiegelte Displays, Top-Trainer-Boxen und Decks.",
    locale: "de_DE",
    type: "website",
    images: ["/images/hero-sortiment.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#EEF1F6" };

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
                name: "Iwoody",
                url: siteUrl(),
                email: catalog.business.email,
                ...(catalog.business.phone ? { telephone: catalog.business.phone } : {}),
                address: {
                  "@type": "PostalAddress",
                  streetAddress: catalog.business.street,
                  postalCode: catalog.business.zip,
                  addressLocality: catalog.business.city,
                  addressCountry: "DE",
                },
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  applicableCountry: "DE",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 14,
                  returnMethod: "https://schema.org/ReturnByMail",
                  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
                  refundType: "https://schema.org/FullRefund",
                  merchantReturnLink: `${siteUrl()}/widerruf`,
                },
              }),
            }}
          />
          <main id="inhalt">{children}</main>
          <Footer
            business={catalog.business}
            checkoutMode={catalog.checkoutMode}
            shipping={catalog.shipping}
            vatRate={catalog.vatRate}
          />
          <ConsentBanner />
        </CartProvider>
      </body>
    </html>
  );
}
