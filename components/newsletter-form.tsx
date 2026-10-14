"use client";

import Link from "next/link";
import { useState } from "react";
import { btnLight, fieldClass } from "@/components/ui";
import { NEWSLETTER_CONSENT } from "@/lib/copy";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-6 max-w-xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        setMessage("");
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, consent, companyWebsite }),
        });
        const data = (await response.json()) as { error?: string; message?: string };
        setPending(false);
        if (!response.ok) {
          setError(data.error || "Das hat nicht geklappt.");
          return;
        }
        setMessage(data.message || "Gespeichert.");
        setEmail("");
        setConsent(false);
      }}
    >
      <label className="block text-sm" htmlFor="newsletter-email">
        E-Mail
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${fieldClass} text-ink`}
          autoComplete="email"
        />
      </label>
      <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1"
          required
        />
        <span>
          {NEWSLETTER_CONSENT}{" "}
          <Link href="/datenschutz" className="underline underline-offset-4">
            Datenschutzerklärung
          </Link>
        </span>
      </label>
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website
          <input value={companyWebsite} onChange={(event) => setCompanyWebsite(event.target.value)} tabIndex={-1} />
        </label>
      </div>
      <button className={`${btnLight} mt-5`} type="submit" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Newsletter anmelden"}
      </button>
      {error ? <p className="mt-3 text-sm text-[#f1d2c4]">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-cream">{message}</p> : null}
    </form>
  );
}
