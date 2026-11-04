"use client";

import { useEffect, useState } from "react";
import { btnPrimary, btnSecondary, fieldClass } from "@/components/ui";
import { formatMoney, formatPrice } from "@/lib/money";
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
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" });
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
            setAuthError(body.error || "Sign-in failed.");
            return;
          }
          setPassword("");
          await load();
        }}
      >
        <h1 className="text-3xl font-medium tracking-tight">Shop admin</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Change stock, prices, shipping, and your business details here. Stock is the quantity customers can
          order.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            In local development with no password set, the password is demo-iwoody. Change it before going live.
          </p>
        ) : null}
        <label className="mt-6 block text-sm">
          Password
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
          Sign in
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
          setError(body.error || "Saving failed.");
          return;
        }
        setMessage("Saved. The shop shows the new values right away.");
        await load();
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Shop admin</h1>
          <p className="mt-2 text-sm text-muted">
            Payment:{" "}
            {data.catalog.checkoutMode === "stripe"
              ? "Stripe is connected. Cash on delivery is off."
              : "Stripe is not connected. Cash on delivery is off, and no payment is processed."}
          </p>
          <p className="text-sm text-muted">
            Email: {data.catalog.emailReady ? "Sending is configured." : "No email provider. No messages are sent."}
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
          Sign out
        </button>
      </div>

      {data.catalog.emailReady ? <TestEmail /> : null}

      <Orders orders={data.orders} />

      <Messages messages={data.messages} newsletter={data.newsletter} />

      <CartAdds days={data.cartAdds} orders={data.orders} names={names} />

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Products</h2>
        <div className="mt-4 space-y-4">
          {draft.products.map((product, index) => (
            <div key={product.slug} className="grid gap-3 border-t border-ink/10 py-4 sm:grid-cols-4">
              <p className="font-medium sm:col-span-4">{names[product.slug]}</p>
              <label className="text-sm">
                Stock
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
                Price in USD
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
                EAN / GTIN (barcode on the packaging)
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="8, 12, 13, or 14 digits"
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
        <h2 className="text-xl font-medium">Shipping</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm">
            Shipping cost in USD
            <input
              className={fieldClass}
              type="number"
              min={0}
              step={0.01}
              value={(draft.shipping.costCents / 100).toFixed(2)}
              onChange={(event) => patchShipping("costCents", Math.round(Number(event.target.value) * 100))}
            />
          </label>
          <Text label="Label" value={draft.shipping.label} onChange={(value) => patchShipping("label", value)} />
          <Text label="Delivery area" value={draft.shipping.destination} onChange={(value) => patchShipping("destination", value)} />
          <Area label="Handling" value={draft.shipping.dispatchText} onChange={(value) => patchShipping("dispatchText", value)} />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.deliveryEstimateConfirmed}
              onChange={(event) => patchShipping("deliveryEstimateConfirmed", event.target.checked)}
            />
            Delivery time is confirmed by the supplier
          </label>
          <Area
            label="Confirmed delivery time"
            value={draft.shipping.deliveryEstimateText}
            onChange={(value) => patchShipping("deliveryEstimateText", value)}
          />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.trackingAvailable}
              onChange={(event) => patchShipping("trackingAvailable", event.target.checked)}
            />
            Tracking is available
          </label>
          <Area label="Tracking note" value={draft.shipping.trackingText} onChange={(value) => patchShipping("trackingText", value)} />
          <Area label="Bulky goods" value={draft.shipping.bulkyGoodsText} onChange={(value) => patchShipping("bulkyGoodsText", value)} />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.appointmentRequired}
              onChange={(event) => patchShipping("appointmentRequired", event.target.checked)}
            />
            Delivery appointment must be confirmed
          </label>
          <Area label="Appointment note" value={draft.shipping.appointmentText} onChange={(value) => patchShipping("appointmentText", value)} />
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.shipping.assemblyIncluded}
              onChange={(event) => patchShipping("assemblyIncluded", event.target.checked)}
            />
            Extra service is included
          </label>
          <Area label="Packaging note" value={draft.shipping.assemblyText} onChange={(value) => patchShipping("assemblyText", value)} />
          <Area label="Hard-to-reach locations" value={draft.shipping.remoteText} onChange={(value) => patchShipping("remoteText", value)} />
          <Area label="Shipping damage" value={draft.shipping.damageText} onChange={(value) => patchShipping("damageText", value)} />
          <label className="text-sm">
            Hold time for an open Stripe payment, in hours
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
        <h2 className="text-xl font-medium">Delivery note</h2>
        <textarea
          className={fieldClass}
          rows={5}
          value={draft.installationText}
          onChange={(event) => setDraft((prev) => (prev ? { ...prev, installationText: event.target.value } : prev))}
        />
      </section>

      <section className="rounded-3xl bg-paper p-5">
        <h2 className="text-xl font-medium">Business details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["owner", "Represented by"],
              ["street", "Street address"],
              ["zip", "ZIP code"],
              ["city", "City"],
              ["country", "Country"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["vatId", "Tax ID"],
              ["responsiblePerson", "Responsible for content"],
            ] as const
          ).map(([key, label]) => (
            <Text key={key} label={label} value={draft.business[key]} onChange={(value) => patchBusiness(key, value)} />
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-oak">{error}</p> : null}
      {message ? <p className="text-sm text-moss">{message}</p> : null}
      <button className={btnPrimary} type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
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
    setStatus({ ok: response.ok, text: body.message || body.error || "Unknown error." });
  }

  return (
    <section className="rounded-3xl bg-paper p-5">
      <h2 className="text-xl font-medium">Test order confirmation</h2>
      <p className="mt-1 text-sm text-muted">
        Sends the email buyers get after paying, using a sample order. This creates no order and no
        payment.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          Email address
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
          {sending ? "Sending…" : "Send test"}
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
    if (!window.confirm(`Send confirmation for ${order.id} to ${order.customer.email}?`)) return;
    setSending(true);
    setStatus(null);
    const response = await fetch("/api/admin/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const body = (await response.json()) as { message?: string; error?: string };
    setSending(false);
    setStatus({ ok: response.ok, text: body.message || body.error || "Unknown error." });
  }

  return (
    <div className="mt-2">
      <button type="button" className={btnSecondary} disabled={sending} onClick={() => void send()}>
        {sending ? "Sending…" : order.emailSent ? "Resend confirmation" : "Send confirmation"}
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
  // Old orders are in EUR and new ones in USD, so revenue is summed per currency, never across them.
  const revenue = new Map<string, number>();
  for (const order of paid) {
    const currency = order.currency ?? "EUR";
    revenue.set(currency, (revenue.get(currency) ?? 0) + order.totalGrossCents);
  }
  const revenueText = [...revenue].map(([currency, cents]) => formatMoney(cents, currency)).join(" + ") || formatPrice(0);

  return (
    <section className="rounded-3xl bg-paper p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium">Orders</h2>
          <p className="mt-1 text-sm text-muted">
            {paid.length} paid · Revenue {revenueText} · {orders.length} orders in total
          </p>
        </div>
        <label className="text-sm">
          Show
          <select className={fieldClass} value={filter} onChange={(event) => setFilter(event.target.value as OrderFilter)}>
            <option value="alle">All</option>
            <option value="bezahlt">Paid</option>
            <option value="offen">Payment pending</option>
            <option value="sonstige">Canceled, expired, inquiries</option>
          </select>
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No orders.</p>
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
                  <span className="font-medium sm:text-right">{formatMoney(order.totalGrossCents, order.currency)}</span>
                </summary>
                <div className="grid gap-5 pb-5 text-sm sm:grid-cols-3">
                  <div>
                    <h3 className="font-medium">Customer</h3>
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
                    <h3 className="font-medium">Shipping address</h3>
                    <p className="mt-1">
                      {c.street}
                      <br />
                      {c.zip} {c.city}
                      <br />
                      {c.country}
                    </p>
                    {c.deliveryNote ? <p className="mt-1 text-muted">Note: {c.deliveryNote}</p> : null}
                  </div>
                  <div>
                    <h3 className="font-medium">Order</h3>
                    <p className="mt-1">Number {order.id}</p>
                    <p>{statusLabel[order.status]}</p>
                    {order.stripeSessionId ? <p className="break-all text-muted">Stripe {order.stripeSessionId}</p> : null}
                    <p className="text-muted">{order.emailSent ? "Email sent" : order.emailNote || "No email"}</p>
                    <p className="text-muted">{order.telegramSent ? "Telegram alert sent" : "No Telegram alert sent"}</p>
                    {order.status === "bezahlt" || order.status === "anfrage" || order.status === "nachnahme" ? (
                      <SendConfirmation order={order} />
                    ) : null}
                  </div>
                  <div className="sm:col-span-3">
                    <h3 className="font-medium">Items</h3>
                    <ul className="mt-1 divide-y divide-ink/10">
                      {order.items.map((item) => (
                        <li key={item.slug} className="flex justify-between gap-4 py-1.5">
                          <span>
                            {item.qty} × {item.name}
                            <span className="block text-muted">
                              {item.sku} · {formatMoney(item.unitGrossCents, order.currency)} each
                            </span>
                          </span>
                          <span>{formatMoney(item.unitGrossCents * item.qty, order.currency)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-4 py-1.5 text-muted">
                        <span>Shipping ({order.shippingLabel})</span>
                        <span>{formatMoney(order.shippingGrossCents, order.currency)}</span>
                      </li>
                      <li className="flex justify-between gap-4 py-1.5 font-medium">
                        <span>Total</span>
                        <span>{formatMoney(order.totalGrossCents, order.currency)}</span>
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
        <h2 className="text-xl font-medium">Contact messages ({messages.length})</h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No messages yet.</p>
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
          <p className="mt-3 text-sm text-muted">No signups yet.</p>
        ) : (
          <ul className="mt-3 max-h-[32rem] divide-y divide-ink/10 overflow-y-auto text-sm">
            {newsletter.map((entry) => (
              <li key={entry.email} className="py-2">
                <span className="font-medium">{entry.email}</span>
                <span className="block text-muted">
                  {dateTime(entry.createdAt)} ·{" "}
                  {entry.confirmed
                    ? "confirmed"
                    : entry.confirmationEmailSent
                      ? "email sent, not confirmed"
                      : "no email sent, not confirmed"}
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

/** Clicks on "Add to cart" next to the Stripe payments started and paid for the same product, last 30 days. */
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
      <h2 className="text-xl font-medium">Add to cart</h2>
      <p className="mt-2 text-sm text-muted">
        Today {total(days.slice(0, 1))} · 7 days {total(days.slice(0, 7))} · {days.length} days {total(days)} clicks
      </p>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No clicks counted yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 font-medium">Product ({days.length} days)</th>
                <th className="py-2 text-right font-medium">Cart</th>
                <th className="py-2 text-right font-medium">Payment started</th>
                <th className="py-2 text-right font-medium">Paid</th>
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
