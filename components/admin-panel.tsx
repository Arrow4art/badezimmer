"use client";

import { useEffect, useState } from "react";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import { formatEUR } from "@/lib/money";
import { statusLabel } from "@/lib/order-text";
import type { CartAddDay } from "@/lib/cart-adds";
import type {
  AdminUpdate,
  BusinessInfo,
  Catalog,
  ContactMessage,
  NewsletterEntry,
  Order,
  ShippingConfig,
} from "@/lib/types";

type Payload = {
  catalog: Catalog;
  orders: Order[];
  cartAdds: CartAddDay[];
  messages: ContactMessage[];
  newsletter: NewsletterEntry[];
  devPasswordHint: boolean;
};

function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
}

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
            In der lokalen Entwicklung ohne gesetztes Passwort gilt: demo-iwoody. Vor einem echten Betrieb ändern.
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

      {data.catalog.emailReady ? <TestEmail /> : null}

      <Orders orders={data.orders} />

      <Messages messages={data.messages} newsletter={data.newsletter} />

      <CartAdds days={data.cartAdds} orders={data.orders} names={names} />

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Produkte</h2>
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
                  min={0.5}
                  max={5000}
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

      {error ? <p className="text-sm text-oak">{error}</p> : null}
      {message ? <p className="text-sm text-moss">{message}</p> : null}
      <button className={btnPrimary} type="submit" disabled={pending}>
        {pending ? "Speichert …" : "Änderungen speichern"}
      </button>
    </form>
  );
}

/** Sends the confirmation a buyer gets after paying, for a made-up order, to any address. Lives inside the settings form, so no nested form. */
function TestEmail() {
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    setStatus(null);
    const response = await fetch("/api/admin/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    const body = (await response.json()) as { message?: string; error?: string };
    setSending(false);
    setStatus({ ok: response.ok, text: body.message || body.error || "Unbekannter Fehler." });
  }

  return (
    <section className="rounded-3xl bg-paper p-5">
      <h2 className="text-xl font-medium">Test-Bestellbestätigung</h2>
      <p className="mt-1 text-sm text-muted">
        Schickt die E-Mail, die Käufer nach der Zahlung bekommen, mit einer Beispielbestellung. Es entsteht keine
        Bestellung und keine Zahlung.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          E-Mail-Adresse
          <input
            className={fieldClass}
            type="email"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (to && !sending) void send();
              }
            }}
            placeholder="name@example.com"
          />
        </label>
        <button type="button" className={btnSecondary} disabled={!to || sending} onClick={() => void send()}>
          {sending ? "Sendet …" : "Test senden"}
        </button>
      </div>
      {status ? <p className={`mt-3 text-sm ${status.ok ? "text-moss" : "text-oak"}`}>{status.text}</p> : null}
    </section>
  );
}

/** Sends this order's confirmation email to the buyer, e.g. when it was paid before email was set up. Asks first. */
function SendConfirmation({ order }: { order: Order }) {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    if (!window.confirm(`Bestätigung für ${order.id} an ${order.customer.email} senden?`)) return;
    setSending(true);
    setStatus(null);
    const response = await fetch("/api/admin/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const body = (await response.json()) as { message?: string; error?: string };
    setSending(false);
    setStatus({ ok: response.ok, text: body.message || body.error || "Unbekannter Fehler." });
  }

  return (
    <div className="mt-2">
      <button type="button" className={btnSecondary} disabled={sending} onClick={() => void send()}>
        {sending ? "Sendet …" : order.emailSent ? "Bestätigung erneut senden" : "Bestätigung senden"}
      </button>
      {status ? <p className={`mt-2 ${status.ok ? "text-moss" : "text-oak"}`}>{status.text}</p> : null}
    </div>
  );
}

type OrderFilter = "alle" | "bezahlt" | "offen" | "sonstige";

/** Every order with customer, address, items, totals and payment details, newest first. */
function Orders({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<OrderFilter>("alle");
  const [openId, setOpenId] = useState("");

  // The Telegram alert links to /admin#<order id>, which opens and shows that order.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    setOpenId(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);

  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const shown = sorted.filter((order) => {
    if (filter === "bezahlt") return order.status === "bezahlt";
    if (filter === "offen") return order.status === "zahlung_ausstehend";
    if (filter === "sonstige") return order.status !== "bezahlt" && order.status !== "zahlung_ausstehend";
    return true;
  });
  const paid = orders.filter((order) => order.status === "bezahlt");
  const revenue = paid.reduce((sum, order) => sum + order.totalGrossCents, 0);

  return (
    <section className="rounded-3xl bg-paper p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium">Bestellungen</h2>
          <p className="mt-1 text-sm text-muted">
            {paid.length} bezahlt · Umsatz {formatEUR(revenue)} · {orders.length} Vorgänge insgesamt
          </p>
        </div>
        <label className="text-sm">
          Anzeigen
          <select className={fieldClass} value={filter} onChange={(event) => setFilter(event.target.value as OrderFilter)}>
            <option value="alle">Alle</option>
            <option value="bezahlt">Bezahlt</option>
            <option value="offen">Zahlung offen</option>
            <option value="sonstige">Abgebrochen, abgelaufen, Anfragen</option>
          </select>
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Keine Vorgänge.</p>
      ) : (
        <div className="mt-4">
          {shown.map((order) => {
            const c = order.customer;
            return (
              <details key={order.id} id={order.id} open={openId === order.id} className="scroll-mt-24 border-t border-ink/10">
                <summary className="grid cursor-pointer gap-1 py-3 text-sm sm:grid-cols-[10rem_1fr_11rem_6rem] sm:items-center sm:gap-4">
                  <span className="text-muted">{dateTime(order.createdAt)}</span>
                  <span>
                    <span className="font-medium">
                      {c.firstName} {c.lastName}
                    </span>
                    <span className="block text-muted">
                      {order.items.map((item) => `${item.qty} × ${item.name}`).join(", ")}
                    </span>
                  </span>
                  <span className={order.status === "bezahlt" ? "text-moss" : "text-muted"}>{statusLabel[order.status]}</span>
                  <span className="font-medium sm:text-right">{formatEUR(order.totalGrossCents)}</span>
                </summary>
                <div className="grid gap-5 pb-5 text-sm sm:grid-cols-3">
                  <div>
                    <h3 className="font-medium">Kunde</h3>
                    <p className="mt-1">
                      {c.firstName} {c.lastName}
                    </p>
                    <a className="block underline underline-offset-4" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                    {c.phone ? (
                      <a className="block underline underline-offset-4" href={`tel:${c.phone}`}>
                        {c.phone}
                      </a>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="font-medium">Lieferadresse</h3>
                    <p className="mt-1">
                      {c.street}
                      <br />
                      {c.zip} {c.city}
                      <br />
                      {c.country}
                    </p>
                    {c.deliveryNote ? <p className="mt-1 text-muted">Hinweis: {c.deliveryNote}</p> : null}
                  </div>
                  <div>
                    <h3 className="font-medium">Vorgang</h3>
                    <p className="mt-1">Nummer {order.id}</p>
                    <p>{statusLabel[order.status]}</p>
                    {order.stripeSessionId ? <p className="break-all text-muted">Stripe {order.stripeSessionId}</p> : null}
                    <p className="text-muted">{order.emailSent ? "E-Mail versendet" : order.emailNote || "Keine E-Mail"}</p>
                    <p className="text-muted">{order.telegramSent ? "Telegram gemeldet" : "Nicht per Telegram gemeldet"}</p>
                    {order.status === "bezahlt" || order.status === "anfrage" || order.status === "nachnahme" ? (
                      <SendConfirmation order={order} />
                    ) : null}
                  </div>
                  <div className="sm:col-span-3">
                    <h3 className="font-medium">Artikel</h3>
                    <ul className="mt-1 divide-y divide-ink/10">
                      {order.items.map((item) => (
                        <li key={item.slug} className="flex justify-between gap-4 py-1.5">
                          <span>
                            {item.qty} × {item.name}
                            <span className="block text-muted">
                              {item.sku} · je {formatEUR(item.unitGrossCents)}
                            </span>
                          </span>
                          <span>{formatEUR(item.unitGrossCents * item.qty)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-4 py-1.5 text-muted">
                        <span>Versand ({order.shippingLabel})</span>
                        <span>{formatEUR(order.shippingGrossCents)}</span>
                      </li>
                      <li className="flex justify-between gap-4 py-1.5 font-medium">
                        <span>Gesamt inkl. {Math.round(order.vatRate * 100)} % MwSt.</span>
                        <span>{formatEUR(order.totalGrossCents)}</span>
                      </li>
                    </ul>
                    {order.note ? <p className="mt-2 text-muted">{order.note}</p> : null}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Messages({ messages, newsletter }: { messages: ContactMessage[]; newsletter: NewsletterEntry[] }) {
  return (
    <section className="grid gap-5 rounded-3xl bg-paper p-5 lg:grid-cols-2">
      <div>
        <h2 className="text-xl font-medium">Kontaktnachrichten ({messages.length})</h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Noch keine Nachrichten.</p>
        ) : (
          <ul className="mt-3 max-h-[32rem] divide-y divide-ink/10 overflow-y-auto text-sm">
            {messages.map((message) => (
              <li key={message.id} className="py-3">
                <p className="text-muted">{dateTime(message.createdAt)}</p>
                <p className="font-medium">{message.name}</p>
                <a className="underline underline-offset-4" href={`mailto:${message.email}`}>
                  {message.email}
                </a>
                <p className="mt-1 whitespace-pre-wrap">{message.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-xl font-medium">Newsletter ({newsletter.length})</h2>
        {newsletter.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Noch keine Anmeldungen.</p>
        ) : (
          <ul className="mt-3 max-h-[32rem] divide-y divide-ink/10 overflow-y-auto text-sm">
            {newsletter.map((entry) => (
              <li key={entry.email} className="py-2">
                <span className="font-medium">{entry.email}</span>
                <span className="block text-muted">
                  {dateTime(entry.createdAt)} ·{" "}
                  {entry.confirmed
                    ? "bestätigt"
                    : entry.confirmationEmailSent
                      ? "E-Mail gesendet, nicht bestätigt"
                      : "keine E-Mail gesendet, nicht bestätigt"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

type FunnelRow ={ slug: string; adds: number; started: number; paid: number };

/** Clicks on "In den Warenkorb" next to the Stripe payments started and paid for the same product, last 30 days. */
function CartAdds({ days, orders, names }: { days: CartAddDay[]; orders: Order[]; names: Record<string, string> }) {
  const total = (list: CartAddDay[]) =>
    list.reduce((sum, day) => sum + Object.values(day.counts).reduce((a, b) => a + b, 0), 0);
  const rows = new Map<string, FunnelRow>();
  const row = (slug: string) => {
    let entry = rows.get(slug);
    if (!entry) rows.set(slug, (entry = { slug, adds: 0, started: 0, paid: 0 }));
    return entry;
  };
  for (const day of days) {
    for (const [slug, count] of Object.entries(day.counts)) row(slug).adds += count;
  }
  const since = Date.now() - days.length * 86_400_000;
  for (const order of orders) {
    // Inquiries and cash on delivery never reach the Stripe payment page.
    if (order.status === "anfrage" || order.status === "nachnahme" || Date.parse(order.createdAt) < since) continue;
    for (const item of order.items) {
      row(item.slug).started += 1;
      if (order.status === "bezahlt") row(item.slug).paid += 1;
    }
  }
  const sorted = [...rows.values()].sort((a, b) => b.adds - a.adds || b.paid - a.paid);

  return (
    <section className="rounded-3xl bg-paper p-5">
      <h2 className="text-xl font-medium">In den Warenkorb</h2>
      <p className="mt-2 text-sm text-muted">
        Heute {total(days.slice(0, 1))} · 7 Tage {total(days.slice(0, 7))} · {days.length} Tage {total(days)} Klicks
      </p>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Noch keine Klicks gezählt.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 font-medium">Produkt ({days.length} Tage)</th>
                <th className="py-2 text-right font-medium">Warenkorb</th>
                <th className="py-2 text-right font-medium">Zahlung gestartet</th>
                <th className="py-2 text-right font-medium">Bezahlt</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.slug} className="border-t border-ink/10">
                  <td className="py-2">{names[entry.slug] ?? entry.slug}</td>
                  <td className="py-2 text-right">{entry.adds}</td>
                  <td className="py-2 text-right">{entry.started}</td>
                  <td className="py-2 text-right">{entry.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
