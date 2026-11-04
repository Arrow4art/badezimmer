import { randomBytes } from "node:crypto";
import { summarize } from "@/lib/money";
import { withLock } from "@/lib/lock";
import { readMessages, readOrders, writeMessages, writeNewsletter, readNewsletter, writeOrders } from "@/lib/records";
import { normalizeGtin, productBrand } from "@/lib/product-ids";
import { readStore, writeStore } from "@/lib/store";
import type {
  AdminUpdate,
  Catalog,
  Customer,
  Order,
  OrderItem,
  Product,
  PublicProduct,
} from "@/lib/types";

function reservedQty(orders: Order[], slug: string): number {
  return orders
    .filter((order) => order.status === "zahlung_ausstehend")
    .flatMap((order) => order.items)
    .filter((item) => item.slug === slug)
    .reduce((sum, item) => sum + item.qty, 0);
}

function toPublic(product: Product, orders: Order[]): PublicProduct {
  return {
    ...product,
    available: Math.max(0, product.stock - reservedQty(orders, product.slug)),
  };
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
      "The payment window has expired. Nothing was charged and stock wasn't reduced.";
    changed = true;
  }
  if (changed) await writeOrders(orders);
}

export async function getCatalog(): Promise<Catalog> {
  return withLock(async () => {
    await expireStale();
    const store = await readStore();
    const orders = await readOrders();
    const products = store.products.map((product) => toPublic(product, orders));
    const checkoutMode: Catalog["checkoutMode"] = process.env.STRIPE_SECRET_KEY ? "stripe" : "inquiry";
    return {
      vatRate: store.vatRate,
      installationText: store.installationText,
      shipping: store.shipping,
      business: store.business,
      products,
      checkoutMode,
      paymentReady: true,
      emailReady: Boolean(process.env.RESEND_API_KEY && process.env.ORDER_EMAIL_FROM),
    };
  });
}

export async function getProduct(slug: string): Promise<PublicProduct | undefined> {
  const catalog = await getCatalog();
  return catalog.products.find((product) => product.slug === slug);
}

/** Up to `limit` other products, same game (brand) first, then the rest of the catalog to fill up. */
export function relatedProducts(catalog: Catalog, current: PublicProduct, limit = 6): PublicProduct[] {
  const others = catalog.products.filter((product) => product.slug !== current.slug);
  const game = productBrand(current);
  const sameGame = game ? others.filter((product) => productBrand(product) === game) : [];
  const rest = others.filter((product) => !sameGame.includes(product));
  return [...sameGame, ...rest].slice(0, limit);
}

function newId(): string {
  return `IW-${randomBytes(5).toString("hex").toUpperCase()}`;
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
  if (requested.length === 0) return { error: "Your cart is empty." };
  const items: OrderItem[] = [];
  for (const line of requested) {
    const product = catalogProducts.find((entry) => entry.slug === line.slug);
    if (!product) return { error: "A product is no longer in our catalog." };
    if (!Number.isInteger(line.qty) || line.qty < 1) {
      return { error: "Please choose a valid quantity." };
    }
    if (line.qty > product.available) {
      return {
        error: `"${product.name}" is no longer available in this quantity.`,
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
    const products = store.products.map((product) => toPublic(product, orders));
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
      currency: "USD",
      goodsGrossCents: summary.goodsGrossCents,
      totalGrossCents: summary.totalGrossCents,
      paymentProvider: "none",
      emailSent: false,
      emailNote: "",
      note: "Non-binding inquiry. No payment was made and stock wasn't reduced.",
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
    const products = store.products.map((product) => toPublic(product, orders));
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
      currency: "USD",
      goodsGrossCents: summary.goodsGrossCents,
      totalGrossCents: summary.totalGrossCents,
      paymentProvider: "stripe",
      emailSent: false,
      emailNote: "",
      note: "Waiting for a confirmed payment from Stripe. Not paid yet.",
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
  note = "The payment was canceled. Nothing was charged.",
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
    if (order.status !== "zahlung_ausstehend" && order.status !== "abgelaufen") return order;
    const store = await readStore();
    for (const item of order.items) {
      const product = store.products.find((entry) => entry.slug === item.slug);
      if (!product) continue;
      product.stock = Math.max(0, product.stock - item.qty);
    }
    order.status = "bezahlt";
    order.stripeSessionId = sessionId;
    order.note =
      "Payment confirmed by Stripe. Pilands Cards doesn't hold card details. Shop stock was reduced by the paid quantity.";
    await writeStore(store);
    await writeOrders(orders);
    return order;
  });
}

/** Marks the owner's Telegram alert as sent; true only for the first caller, so the webhook and the order page never both send it. */
export async function claimTelegramAlert(orderId: string): Promise<boolean> {
  return withLock(async () => {
    const orders = await readOrders();
    const order = orders.find((entry) => entry.id === orderId);
    if (!order || order.telegramSent) return false;
    order.telegramSent = true;
    await writeOrders(orders);
    return true;
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
  if (input.products.length < 1) return "At least one product must remain.";
  for (const product of input.products) {
    if (!Number.isInteger(product.stock) || product.stock < 0 || product.stock > 9999) {
      return "Stock must be a whole number between 0 and 9999.";
    }
    if (!Number.isInteger(product.priceCents) || product.priceCents < 50 || product.priceCents > 500000) {
      return "Each price must be between $0.50 and $5,000.00.";
    }
    if (product.gtin.trim() && !normalizeGtin(product.gtin)) {
      return `The EAN for "${product.slug}" is invalid. Please check the 8, 12, 13, or 14 digits under the barcode.`;
    }
  }
  const shipping = input.shipping;
  if (!Number.isInteger(shipping.costCents) || shipping.costCents < 0 || shipping.costCents > 500000) {
    return "Shipping cost must be between $0.00 and $5,000.00.";
  }
  if (!Number.isInteger(shipping.reservationHours) || shipping.reservationHours < 1 || shipping.reservationHours > 72) {
    return "The hold time must be between 1 and 72 hours.";
  }
  if (shipping.deliveryEstimateConfirmed && !shipping.deliveryEstimateText.trim()) {
    return "A confirmed delivery time needs text.";
  }
  if (input.installationText.trim().length < 20) {
    return "Please add a clear delivery note.";
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
      const gtin = normalizeGtin(update.gtin);
      if (gtin) product.gtin = gtin;
      else delete product.gtin;
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
