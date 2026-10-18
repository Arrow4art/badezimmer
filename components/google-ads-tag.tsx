import Script from "next/script";

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18513827613";

export function GoogleAdsTag() {
  if (!/^AW-\d+$/.test(googleAdsId)) return null;

  return (
    <>
      <Script id="google-ads-consent" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          gtag('set', 'ads_data_redaction', true);
          gtag('set', 'url_passthrough', true);
          gtag('js', new Date());
          gtag('config', '${googleAdsId}');
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} strategy="afterInteractive" />
    </>
  );
}
