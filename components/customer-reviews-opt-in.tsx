"use client";

import { useEffect } from "react";

// Merchant Center account that runs Google Customer Reviews. The env variable overrides it.
const merchantId = Number(process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_ID?.trim() || "5874940707");

// The survey email should arrive after the parcel: the shop promises 0–3 working days, plus one spare day.
const deliveryWorkingDays = 4;

declare global {
  interface Window {
    renderOptIn?: () => void;
    gapi?: {
      load: (name: string, callback: () => void) => void;
      surveyoptin?: { render: (options: Record<string, unknown>) => void };
    };
  }
}

function addWorkingDays(start: Date, days: number) {
  const date = new Date(start);
  while (days > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) days -= 1;
  }
  return date.toISOString().slice(0, 10);
}

/** Shows Google's opt-in for a shop review survey after a paid order, only after the visitor agreed in the consent banner. */
export function CustomerReviewsOptIn({ orderId, email, createdAt }: { orderId: string; email: string; createdAt: string }) {
  useEffect(() => {
    if (!merchantId) return;
    const key = `customer-reviews-${orderId}`;
    try {
      if (localStorage.getItem("badezimmer-consent") !== "granted" || localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      return;
    }
    window.renderOptIn = () => {
      window.gapi?.load("surveyoptin", () => {
        window.gapi?.surveyoptin?.render({
          merchant_id: merchantId,
          order_id: orderId,
          email,
          delivery_country: "DE",
          estimated_delivery_date: addWorkingDays(new Date(createdAt), deliveryWorkingDays),
          opt_in_style: "CENTER_DIALOG",
        });
      });
    };
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
    script.async = true;
    document.body.appendChild(script);
  }, [orderId, email, createdAt]);
  return null;
}
