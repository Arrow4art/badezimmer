"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { btnSecondary } from "@/components/ui";

const KEY = "badezimmer-consent";

type Choice = "granted" | "denied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(choice: Choice) {
  const state = choice === "granted" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "granted" || stored === "denied") {
      applyConsent(stored);
      return;
    }
    setOpen(true);
  }, []);

  function choose(choice: Choice) {
    localStorage.setItem(KEY, choice);
    applyConsent(choice);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper px-5 py-4 shadow-card"
      role="dialog"
      aria-labelledby="consent-title"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="consent-title" className="max-w-3xl text-sm leading-relaxed">
          Google Ads misst Besuche und Google Kundenrezensionen fragt nach einem Kauf nach einer Bewertung, beides nur nach
          Ihrer Wahl. Ohne Zustimmung bleibt der Werbungsspeicher aus. Details stehen in der{" "}
          <Link href="/datenschutz" className="underline underline-offset-4">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className={btnSecondary} onClick={() => choose("denied")}>
            Ablehnen
          </button>
          <button type="button" className={btnSecondary} onClick={() => choose("granted")}>
            Zustimmen
          </button>
        </div>
      </div>
    </div>
  );
}
