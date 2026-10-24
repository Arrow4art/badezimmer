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
    default: "Badezimmer — Mini-Saunen für zu Hause",
    template: "%s · Badezimmer",
  },
  description:
    "Kompakte Mini-Saunen für zu Hause. Sechs Modelle, Preise inklusive 19 % MwSt., kostenloser Versand innerhalb Deutschlands in 0–3 Werktagen, Zahlung per Nachnahme.",
  robots:
    process.env.ALLOW_INDEXING === "false"
      ? { index: false, follow: false }
      : { index: true, follow: true },
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "OnlineStore",
                name: "Badezimmer",
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
                ...(catalog.business.legalName
                  ? { founder: { "@type": "Person", name: catalog.business.legalName } }
                  : {}),
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
