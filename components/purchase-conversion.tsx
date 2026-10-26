"use client";

import { useEffect } from "react";
import { googleAdsId } from "@/components/google-ads-tag";

// Label of the "Purchase" conversion action in Google Ads (Goals → Conversions → the action →
// Tag setup → "send_to": AW-…/<label>). Without it nothing is reported.
const purchaseLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL?.trim() ?? "";

/** Reports one paid order to Google Ads, once per order even if the page is reloaded. */
export function PurchaseConversion({ orderId, valueCents }: { orderId: string; valueCents: number }) {
  useEffect(() => {
    if (!purchaseLabel || !/^AW-\d+$/.test(googleAdsId) || !window.gtag) return;
    const key = `ads-conversion-${orderId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: transaction_id still lets Google drop duplicates.
    }
    window.gtag("event", "conversion", {
      send_to: `${googleAdsId}/${purchaseLabel}`,
      value: valueCents / 100,
      currency: "EUR",
      transaction_id: orderId,
    });
  }, [orderId, valueCents]);
  return null;
}
