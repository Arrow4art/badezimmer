"use client";

import { useEffect, useState } from "react";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import { formatEUR } from "@/lib/money";
import { statusLabel } from "@/lib/order-text";
import type { AdminUpdate, BusinessInfo, Catalog, Order, ShippingConfig } from "@/lib/types";

type Payload = {
  catalog: Catalog;
  orders: Order[];
  devPasswordHint: boolean;
};

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<AdminUpdate | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/data");
    if (response.status === 401) {
      setData(null);
      return;
    }
    const payload = (await response.json()) as Payload;
    setData(payload);
    setNames(Object.fromEntries(payload.catalog.products.map((product) => [product.slug, product.name])));
    setDraft({
      products: payload.catalog.products.map((product) => ({
        slug: product.slug,
        stock: product.stock,
        priceCents: product.priceCents,
        gtin: product.gtin ?? "",
      })),
      shipping: payload.catalog.shipping,
      business: payload.catalog.business,
      installationText: payload.catalog.installationText,
    });
  }

  useEffect(() => {
    void load();
  }, []);

  if (!data || !draft) {
    return (
      <form
        className="mx-auto max-w-md px-5 py-16"
        onSubmit={async (event) => {
          event.preventDefault();
          setAuthError("");
          const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          const body = (await response.json()) as { error?: string };
          if (!response.ok) {
            setAuthError(body.error || "Anmeldung fehlgeschlagen.");
            return;
          }
          setPassword("");
          await load();
        }}
      >
        <h1 className="text-3xl font-medium tracking-tight">Shop-Verwaltung</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Hier ändern Sie Bestand, Preise, Versand und die Angaben für das Impressum. Der Bestand ist die Menge, die Kunden
          bestellen können.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            In der lokalen Entwicklung ohne gesetztes Passwort gilt: demo-badezimmer. Vor einem echten Betrieb ändern.
          </p>
        ) : null}
        <label className="mt-6 block text-sm">
          Passwort
          <input
            className={fieldClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {authError ? <p className="mt-3 text-sm text-oak">{authError}</p> : null}
        <button className={`${btnPrimary} mt-5`} type="submit">
          Anmelden
        </button>
      </form>
    );
  }

  function patchShipping<K extends keyof ShippingConfig>(key: K, value: ShippingConfig[K]) {
    setDraft((prev) => (prev ? { ...prev, shipping: { ...prev.shipping, [key]: value } } : prev));
  }

  function patchBusiness<K extends keyof BusinessInfo>(key: K, value: string) {
    setDraft((prev) => (prev ? { ...prev, business: { ...prev.business, [key]: value } } : prev));
  }

  return (
    <form
      className="mx-auto max-w-5xl space-y-10 px-5 py-12"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        setMessage("");
        const response = await fetch("/api/admin/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const body = (await response.json()) as { error?: string };
        setPending(false);
        if (!response.ok) {
          setError(body.error || "Speichern fehlgeschlagen.");
          return;
        }
        setMessage("Gespeichert. Der Shop zeigt die neuen Werte sofort.");
        await load();
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Shop-Verwaltung</h1>
          <p className="mt-2 text-sm text-muted">
            Zahlung:{" "}
            {data.catalog.checkoutMode === "stripe"
              ? "Stripe ist verbunden. Nachnahme ist abgeschaltet."
              : "Stripe ist nicht verbunden. Nachnahme ist abgeschaltet, es wird keine Zahlung ausgeführt."}
          </p>
          <p className="text-sm text-muted">
            E-Mail: {data.catalog.emailReady ? "Versand ist konfiguriert." : "Kein E-Mail-Anbieter. Es wird keine Nachricht verschickt."}
          </p>
        </div>
        <button
          type="button"
          className={btnSecondary}
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setData(null);
            setDraft(null);
          }}
        >
          Abmelden
        </button>
      </div>

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Modelle</h2>
        <div className="mt-4 space-y-4">
          {draft.products.map((product, index) => (
            <div key={product.slug} className="grid gap-3 border-t border-ink/10 py-4 sm:grid-cols-4">
              <p className="font-medium sm:col-span-4">{names[product.slug]}</p>
              <label className="text-sm">
                Bestand
                <input
                  className={fieldClass}
                  type="number"
                  min={0}
                  max={999}
                  value={product.stock}
                  onChange={(event) => {
                    const stock = Number(event.target.value);
                    setDraft((prev) => {
                      if (!prev) return prev;
                      const products = prev.products.slice();
                      products[index] = { ...product, stock };
                      return { ...prev, products };
                    });
                  }}
                />
              </label>
              <label className="text-sm">
                Preis in Euro
                <input
                  className={fieldClass}
                  type="number"
                  min={800}
                  max={1600}
                  step={0.01}
                  value={(product.priceCents / 100).toFixed(2)}
                  onChange={(event) => {
                    const priceCents = Math.round(Number(event.target.value) * 100);
                    setDraft((prev) => {
                      if (!prev) return prev;
                      const products = prev.products.slice();
                      products[index] = { ...product, priceCents };
                      return { ...prev, products };
                    });
                  }}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                EAN / GTIN (Barcode auf der Verpackung)
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="8, 12, 13 oder 14 Ziffern"
                  value={product.gtin}
                  onChange={(event) => {
                    const gtin = event.target.value;
                    setDraft((prev) => {
                      if (!prev) return prev;
                      const products = prev.products.slice();
                      products[index] = { ...product, gtin };
                      return { ...prev, products };
                    });
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Versand</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm">
            Versandkosten in Euro
            <input
              className={fieldClass}
              type="number"
              min={0}
              step={0.01}
              value={(draft.shipping.costCents / 100).toFixed(2)}
              onChange={(event) => patchShipping("costCents", Math.round(Number(event.target.value) * 100))}
            />
          </label>
          <Text label="Bezeichnung" value={draft.shipping.label} onChange={(value) => patchShipping("label", value)} />
          <Text label="Liefergebiet" value={draft.shipping.destination} onChange={(value) => patchShipping("destination", value)} />
          <Area label="Versandvorbereitung" value={draft.shipping.dispatchText} onChange={(value) => patchShipping("dispatchText", value)} />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.deliveryEstimateConfirmed}
              onChange={(event) => patchShipping("deliveryEstimateConfirmed", event.target.checked)}
            />
            Lieferzeit ist vom Lieferanten bestätigt
          </label>
          <Area
            label="Bestätigte Lieferzeit"
            value={draft.shipping.deliveryEstimateText}
            onChange={(value) => patchShipping("deliveryEstimateText", value)}
          />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.trackingAvailable}
              onChange={(event) => patchShipping("trackingAvailable", event.target.checked)}
            />
            Sendungsverfolgung ist verfügbar
          </label>
          <Area label="Tracking-Hinweis" value={draft.shipping.trackingText} onChange={(value) => patchShipping("trackingText", value)} />
          <Area label="Sperrgut" value={draft.shipping.bulkyGoodsText} onChange={(value) => patchShipping("bulkyGoodsText", value)} />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.appointmentRequired}
              onChange={(event) => patchShipping("appointmentRequired", event.target.checked)}
            />
            Liefertermin muss bestätigt werden
          </label>
          <Area label="Termin-Hinweis" value={draft.shipping.appointmentText} onChange={(value) => patchShipping("appointmentText", value)} />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.assemblyIncluded}
              onChange={(event) => patchShipping("assemblyIncluded", event.target.checked)}
            />
            Zusatzleistung ist enthalten
          </label>
          <Area label="Verpackungshinweis" value={draft.shipping.assemblyText} onChange={(value) => patchShipping("assemblyText", value)} />
          <Area label="Schwer erreichbare Orte" value={draft.shipping.remoteText} onChange={(value) => patchShipping("remoteText", value)} />
          <Area label="Transportschäden" value={draft.shipping.damageText} onChange={(value) => patchShipping("damageText", value)} />
          <label className="text-sm">
            Reservierung einer offenen Stripe-Zahlung in Stunden
            <input
              className={fieldClass}
              type="number"
              min={1}
              max={72}
              value={draft.shipping.reservationHours}
              onChange={(event) => patchShipping("reservationHours", Number(event.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Lieferhinweis</h2>
        <textarea
          className={fieldClass}
          rows={5}
          value={draft.installationText}
          onChange={(event) => setDraft((prev) => (prev ? { ...prev, installationText: event.target.value } : prev))}
        />
      </section>

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Impressum</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["owner", "Vertreten durch"],
              ["street", "Straße und Hausnummer"],
              ["zip", "PLZ"],
              ["city", "Ort"],
              ["country", "Land"],
              ["email", "E-Mail"],
              ["phone", "Telefon"],
              ["vatId", "USt-IdNr."],
              ["responsiblePerson", "Inhaltlich verantwortlich"],
            ] as const
          ).map(([key, label]) => (
            <Text key={key} label={label} value={draft.business[key]} onChange={(value) => patchBusiness(key, value)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium">Vorgänge</h2>
        {data.orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Noch keine Anfragen oder Zahlungen.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="py-2 font-medium">Nummer</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Summe</th>
                  <th className="py-2 font-medium">E-Mail</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-t border-ink/10">
                    <td className="py-2">{order.id}</td>
                    <td className="py-2">{statusLabel[order.status]}</td>
                    <td className="py-2">{formatEUR(order.totalGrossCents)}</td>
                    <td className="py-2">
                      {order.customer.email}
                      <span className="block text-muted">{order.emailSent ? "E-Mail versendet" : order.emailNote || "Keine E-Mail"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {error ? <p className="text-sm text-oak">{error}</p> : null}
      {message ? <p className="text-sm text-moss">{message}</p> : null}
      <button className={btnPrimary} type="submit" disabled={pending}>
        {pending ? "Speichert …" : "Änderungen speichern"}
      </button>
    </form>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea className={fieldClass} rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
