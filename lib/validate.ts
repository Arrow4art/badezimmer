import type { CheckoutInput } from "@/lib/catalog";
import type { Customer } from "@/lib/types";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function emailOk(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
}

export function parseCheckout(body: unknown): { ok: true; data: CheckoutInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Die Eingaben sind unvollständig." };
  const record = body as Record<string, unknown>;
  if (text(record.companyWebsite, 200)) return { ok: false, error: "Die Eingaben konnten nicht verarbeitet werden." };

  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items = rawItems.slice(0, 6).map((item) => {
    const line = item as Record<string, unknown>;
    return {
      slug: text(line.slug, 80),
      qty: typeof line.qty === "number" ? line.qty : Number(line.qty),
    };
  });

  const customerRaw = (record.customer ?? {}) as Record<string, unknown>;
  const customer: Customer = {
    firstName: text(customerRaw.firstName, 80),
    lastName: text(customerRaw.lastName, 80),
    email: text(customerRaw.email, 160).toLowerCase(),
    phone: text(customerRaw.phone, 40),
    street: text(customerRaw.street, 120),
    zip: text(customerRaw.zip, 5),
    city: text(customerRaw.city, 80),
    country: "Deutschland",
    deliveryNote: text(customerRaw.deliveryNote, 400),
  };

  if (customer.firstName.length < 2 || customer.lastName.length < 2) {
    return { ok: false, error: "Bitte geben Sie Vor- und Nachnamen an." };
  }
  if (!emailOk(customer.email)) return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
  if (customer.street.length < 3) return { ok: false, error: "Bitte geben Sie Straße und Hausnummer an." };
  if (!/^\d{5}$/.test(customer.zip)) return { ok: false, error: "Bitte geben Sie eine deutsche Postleitzahl an." };
  if (customer.city.length < 2) return { ok: false, error: "Bitte geben Sie den Ort an." };
  if (record.acceptTerms !== true) return { ok: false, error: "Bitte bestätigen Sie AGB und Widerrufsbelehrung." };
  if (record.acceptInstallation !== true) {
    return { ok: false, error: "Bitte bestätigen Sie den Lieferhinweis." };
  }
  if (items.length === 0) return { ok: false, error: "Der Warenkorb ist leer." };

  return { ok: true, data: { items, customer } };
}

export function parseContact(body: unknown): { ok: true; data: { name: string; email: string; message: string } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Die Eingaben sind unvollständig." };
  const record = body as Record<string, unknown>;
  if (text(record.companyWebsite, 200)) return { ok: false, error: "Die Eingaben konnten nicht verarbeitet werden." };
  const name = text(record.name, 80);
  const email = text(record.email, 160).toLowerCase();
  const message = text(record.message, 4000);
  if (name.length < 2) return { ok: false, error: "Bitte geben Sie Ihren Namen an." };
  if (!emailOk(email)) return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
  if (message.length < 10) return { ok: false, error: "Bitte schreiben Sie eine kurze Nachricht." };
  if (record.consent !== true) return { ok: false, error: "Bitte bestätigen Sie den Hinweis zum Datenschutz." };
  return { ok: true, data: { name, email, message } };
}

export function parseNewsletter(body: unknown): { ok: true; email: string } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Die Eingaben sind unvollständig." };
  const record = body as Record<string, unknown>;
  if (text(record.companyWebsite, 200)) return { ok: true, email: "" };
  const email = text(record.email, 160).toLowerCase();
  if (!emailOk(email)) return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
  if (record.consent !== true) return { ok: false, error: "Bitte willigen Sie in den Newsletter ein." };
  return { ok: true, email };
}
