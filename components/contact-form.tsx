"use client";

import { useState } from "react";
import { btnPrimary, fieldClass } from "@/components/ui";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        setDone("");
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message, consent, companyWebsite }),
        });
        const data = (await response.json()) as { error?: string; message?: string };
        setPending(false);
        if (!response.ok) {
          setError(data.error || "Die Nachricht konnte nicht gespeichert werden.");
          return;
        }
        setDone(data.message || "Gespeichert.");
        setName("");
        setEmail("");
        setMessage("");
        setConsent(false);
      }}
    >
      <label className="block text-sm">
        Name
        <input className={fieldClass} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
      </label>
      <label className="block text-sm">
        E-Mail
        <input className={fieldClass} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      </label>
      <label className="block text-sm">
        Nachricht
        <textarea className={fieldClass} required rows={6} value={message} onChange={(event) => setMessage(event.target.value)} />
      </label>
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" required />
        <span>Ich habe die Datenschutzerklärung gelesen und bin einverstanden, dass diese Nachricht zur Beantwortung gespeichert wird.</span>
      </label>
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website
          <input value={companyWebsite} onChange={(event) => setCompanyWebsite(event.target.value)} tabIndex={-1} />
        </label>
      </div>
      {error ? <p className="text-sm text-oak">{error}</p> : null}
      {done ? <p className="text-sm text-moss">{done}</p> : null}
      <button className={btnPrimary} type="submit" disabled={pending}>
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
