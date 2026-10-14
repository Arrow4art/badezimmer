import { randomBytes } from "node:crypto";
import { summarize } from "@/lib/money";
import { withLock } from "@/lib/lock";
import { readMessages, readOrders, writeMessages, writeNewsletter, readNewsletter, writeOrders } from "@/lib/records";
import { readStore, writeStore } from "@/lib/store";
import type {
  AdminUpdate,
  Catalog,
  Customer,
  Order,
  OrderItem,
  PublicProduct,
} from "@/lib/types";

const KNOWN_SLUGS = [
  "kompakt-sauna-one",
  "nordik-mini-sauna",
  "premium-relax-sauna",
  "panorama-mini-sauna",
];

function reservedQty(orders: Order[], slug: string): number {
  return orders
    .filter((order) => order.status === "zahlung_ausstehend")
    .flatMap((order) => order.items)
    .filter((item) => item.slug === slug)
    .reduce((sum, item) => sum + item.qty, 0);
}

async function expireStale(now = Date.now()): Promise<void> {
  const store = await readStore();
  const orders = await readOrders();
  const limit = store.shipping.reservationHours * 60 * 60 * 1000;
  let changed = false;
  for (const order of orders) {
    if (order.status !== "zahlung_ausstehend") continue;
    if (now - Date.parse(order.createdAt) <= limit) continue;
    order.status = "abgelaufen";
    order.note =
      "Die Zahlungsfrist ist abgelaufen. Es wurde nichts berechnet und der Bestand nicht verringert.";
    changed = true;
  }
  if (changed) await writeOrders(orders);
}

export async function getCatalog(): Promise<Catalog> {
  return withLock(async () => {
    await expireStale();
    const store = await readStore();
    const orders = await readOrders();
    const products: PublicProduct[] = store.products.map((product) => ({
      ...product,
      available: Math.max(0, product.stock - reservedQty(orders, product.slug)),
    }));
    return {
      vatRate: store.vatRate,
      installationText: store.installationText,
      shipping: store.shipping,
      business: store.business,
      products,
      paymentReady: Boolean(process.env.STRIPE_SECRET_KEY),
      emailReady: Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM),
    };
  });
}

export async function getProduct(slug: string): Promise<PublicProduct | undefined> {
  const catalog = await getCatalog();
  return catalog.products.find((product) => product.slug === slug);
}

export function relatedProducts(catalog: Catalog, slug: string): PublicProduct[] {
  return catalog.products.filter((product) => product.slug !== slug);
}

function newId(): string {
  return `BZ-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export type CheckoutInput = {
  items: { slug: string; qty: number }[];
  customer: Customer;
};

export type CheckoutResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

function buildItems(
  catalogProducts: PublicProduct[],
  requested: { slug: string; qty: number }[],
): { items: OrderItem[] } | { error: string } {
  if (requested.length === 0) return { error: "Der Warenkorb ist leer." };
  const items: OrderItem[] = [];
  for (const line of requested) {
    const product = catalogProducts.find((entry) => entry.slug === line.slug);
    if (!product) return { error: "Ein Produkt ist nicht mehr im Sortiment." };
    if (!Number.isInteger(line.qty) || line.qty < 1) {
      return { error: "Bitte wählen Sie eine gültige Menge." };
    }
    if (line.qty > product.available) {
      return {
        error: `Von „${product.name}“ sind nur noch ${product.available} Stück verfügbar.`,
      };
    }
    items.push({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      qty: line.qty,
      unitGrossCents: product.priceCents,
    });
  }
  return { items };
}

export async function createInquiry(input: CheckoutInput): Promise<CheckoutResult> {
  return withLock(async () => {
    await expireStale();
    const store = await readStore();
    const orders = await readOrders();
    const products: PublicProduct[] = store.products.map((product) => ({
      ...product,
      available: Math.max(0, product.stock - reservedQty(orders, product.slug)),
    }));
    const built = buildItems(products, input.items);
    if ("error" in built) return { ok: false, error: built.error };
    const summary = summarize(built.items, store.shipping.costCents, store.vatRate);
    const order: Order = {
      id: newId(),
      createdAt: new Date().toISOString(),
      status: "anfrage",
      customer: input.customer,
      items: built.items,
      shippingGrossCents: store.shipping.costCents,
      shippingLabel: store.shipping.label,
      vatRate: store.vatRate,
      goodsGrossCents: summary.goodsGrossCents,
      totalGrossCents: summary.totalGrossCents,
      paymentProvider: "none",
      emailSent: false,
      emailNote: "",
      note: "Unverbindliche Anfrage. Es wurde keine Zahlung ausgeführt und der Bestand nicht verringert.",
    };
    orders.unshift(order);
    await writeOrders(orders);
    return { ok: true, order };
  });
}

export async function createPendingOrder(input: CheckoutInput): Promise<CheckoutResult> {
  return withLock(async () => {
    await expireStale();
    const store = await readStore();
    const orders = await readOrders();
    const products: PublicProduct[] = store.products.map((product) => ({
      ...product,
      available: Math.max(0, product.stock - reservedQty(orders, product.slug)),
    }));
    const built = buildItems(products, input.items);
    if ("error" in built) return { ok: false, error: built.error };
    const summary = summarize(built.items, store.shipping.costCents, store.vatRate);
    const order: Order = {
      id: newId(),
      createdAt: new Date().toISOString(),
      status: "zahlung_ausstehend",
      customer: input.customer,
      items: built.items,
      shippingGrossCents: store.shipping.costCents,
      shippingLabel: store.shipping.label,
      vatRate: store.vatRate,
      goodsGrossCents: summary.goodsGrossCents,
      totalGrossCents: summary.totalGrossCents,
      paymentProvider: "stripe",
      emailSent: false,
      emailNote: "",
      note: "Wartet auf eine bestätigte Zahlung bei Stripe. Noch nicht bezahlt.",
    };
    orders.unshift(order);
    await writeOrders(orders);
    return { ok: true, order };
  });
}

export async function attachStripeSession(orderId: string, sessionId: string): Promise<void> {
  await withLock(async () => {
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) return;
    order.stripeSessionId = sessionId;
    await writeOrders(orders);
  });
}

export async function failPendingOrder(orderId: string, note: string): Promise<void> {
  await withLock(async () => {
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);
    if (!order || order.status !== "zahlung_ausstehend") return;
    order.status = "fehlgeschlagen";
    order.note = note;
    await writeOrders(orders);
  });
}

export async function cancelPendingOrder(
  orderId: string,
  note = "Der Zahlungsvorgang wurde abgebrochen. Es wurde nichts berechnet.",
): Promise<Order | null> {
  return withLock(async () => {
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) return null;
    if (order.status === "zahlung_ausstehend") {
      order.status = "storniert";
      order.note = note;
      await writeOrders(orders);
    }
    return order;
  });
}

export async function markPaid(orderId: string, sessionId: string): Promise<Order | null> {
  return withLock(async () => {
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) return null;
    if (order.stripeSessionId && order.stripeSessionId !== sessionId) return order;
    if (order.status === "bezahlt") return order;
    if (order.status !== "zahlung_ausstehend") return order;
    const store = await readStore();
    for (const item of order.items) {
      const product = store.products.find((entry) => entry.slug === item.slug);
      if (!product) continue;
      product.stock = Math.max(0, product.stock - item.qty);
    }
    order.status = "bezahlt";
    order.stripeSessionId = sessionId;
    order.note =
      "Zahlung bei Stripe bestätigt. Kartendaten liegen Badezimmer nicht vor. Der Shop-Bestand wurde um die bezahlte Menge verringert.";
    await writeStore(store);
    await writeOrders(orders);
    return order;
  });
}

export async function setEmailResult(orderId: string, sent: boolean, note: string): Promise<void> {
  await withLock(async () => {
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) return;
    order.emailSent = sent;
    order.emailNote = note;
    await writeOrders(orders);
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function listOrders(): Promise<Order[]> {
  return readOrders();
}

export function validateAdminUpdate(input: AdminUpdate): string | null {
  if (input.products.length !== 4) return "Es müssen genau vier Produkte bleiben.";
  const slugs = input.products.map((product) => product.slug);
  if (slugs.slice().sort().join() !== KNOWN_SLUGS.slice().sort().join()) {
    return "Die Modelle dürfen nicht ersetzt werden.";
  }
  for (const product of input.products) {
    if (!Number.isInteger(product.stock) || product.stock < 0 || product.stock > 999) {
      return "Der Bestand muss eine ganze Zahl zwischen 0 und 999 sein.";
    }
    if (!Number.isInteger(product.priceCents) || product.priceCents < 80000 || product.priceCents > 160000) {
      return "Jeder Preis muss zwischen 800,00 € und 1.600,00 € liegen.";
    }
    if (product.productType !== "infrarot" && product.productType !== "traditionell") {
      return "Die Produktart ist ungültig.";
    }
  }
  const shipping = input.shipping;
  if (!Number.isInteger(shipping.costCents) || shipping.costCents < 0 || shipping.costCents > 500000) {
    return "Die Versandkosten müssen zwischen 0,00 € und 5.000,00 € liegen.";
  }
  if (!Number.isInteger(shipping.reservationHours) || shipping.reservationHours < 1 || shipping.reservationHours > 72) {
    return "Die Reservierungsdauer muss zwischen 1 und 72 Stunden liegen.";
  }
  if (shipping.deliveryEstimateConfirmed && !shipping.deliveryEstimateText.trim()) {
    return "Eine bestätigte Lieferzeit braucht einen Text.";
  }
  if (input.installationText.trim().length < 20) {
    return "Bitte hinterlegen Sie einen verständlichen Hinweis zu Montage und Anschluss.";
  }
  return null;
}

export async function updateCatalog(input: AdminUpdate): Promise<void> {
  await withLock(async () => {
    const store = await readStore();
    for (const update of input.products) {
      const product = store.products.find((entry) => entry.slug === update.slug);
      if (!product) continue;
      product.stock = update.stock;
      product.priceCents = update.priceCents;
      product.productType = update.productType;
      const typeSpec = product.specs.find((spec) => spec.label === "Produktart");
      if (typeSpec) {
        typeSpec.value =
          update.productType === "traditionell"
            ? "Klassische Mini-Sauna, keine Infrarotkabine"
            : "Infrarot-Mini-Sauna, keine klassische Sauna mit Saunaofen";
        typeSpec.status = "unconfirmed";
      }
    }
    store.shipping = input.shipping;
    store.business = input.business;
    store.installationText = input.installationText.trim();
    await writeStore(store);
  });
}

export async function saveNewsletter(email: string, consentText: string): Promise<void> {
  await withLock(async () => {
    const entries = await readNewsletter();
    const existing = entries.find((entry) => entry.email === email);
    if (existing) {
      existing.createdAt = new Date().toISOString();
      existing.consentText = consentText;
      existing.confirmed = false;
      existing.confirmationEmailSent = false;
    } else {
      entries.unshift({
        email,
        consentText,
        createdAt: new Date().toISOString(),
        confirmed: false,
        confirmationEmailSent: false,
      });
    }
    await writeNewsletter(entries);
  });
}

export async function markNewsletterMailed(email: string): Promise<void> {
  await withLock(async () => {
    const entries = await readNewsletter();
    const existing = entries.find((entry) => entry.email === email);
    if (!existing) return;
    existing.confirmationEmailSent = true;
    await writeNewsletter(entries);
  });
}

export async function saveMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await withLock(async () => {
    const messages = await readMessages();
    messages.unshift({
      id: newId(),
      createdAt: new Date().toISOString(),
      name: input.name,
      email: input.email,
      message: input.message,
      consent: true,
    });
    await writeMessages(messages);
  });
}
