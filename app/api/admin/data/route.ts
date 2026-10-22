import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCatalog, listOrders, updateCatalog, validateAdminUpdate } from "@/lib/catalog";
import { devPasswordHint } from "@/lib/auth";
import type { AdminUpdate, BusinessInfo, ProductType, ShippingConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function whole(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) ? value : Number.NaN;
}

function parseUpdate(body: unknown): AdminUpdate | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (!Array.isArray(record.products) || !record.shipping || typeof record.shipping !== "object") return null;
  const shippingRaw = record.shipping as Record<string, unknown>;
  const businessRaw = (record.business ?? {}) as Record<string, unknown>;
  const shipping: ShippingConfig = {
    destination: text(shippingRaw.destination, 120),
    costCents: whole(shippingRaw.costCents),
    label: text(shippingRaw.label, 160),
    dispatchText: text(shippingRaw.dispatchText, 2000),
    deliveryEstimateText: text(shippingRaw.deliveryEstimateText, 500),
    deliveryEstimateConfirmed: shippingRaw.deliveryEstimateConfirmed === true,
    trackingAvailable: shippingRaw.trackingAvailable === true,
    trackingText: text(shippingRaw.trackingText, 2000),
    bulkyGoodsText: text(shippingRaw.bulkyGoodsText, 2000),
    appointmentRequired: shippingRaw.appointmentRequired === true,
    appointmentText: text(shippingRaw.appointmentText, 2000),
    assemblyIncluded: shippingRaw.assemblyIncluded === true,
    assemblyText: text(shippingRaw.assemblyText, 2000),
    remoteText: text(shippingRaw.remoteText, 2000),
    damageText: text(shippingRaw.damageText, 2000),
    reservationHours: whole(shippingRaw.reservationHours),
  };
  const business: BusinessInfo = {
    legalName: text(businessRaw.legalName, 160),
    owner: text(businessRaw.owner, 160),
    street: text(businessRaw.street, 160),
    zip: text(businessRaw.zip, 12),
    city: text(businessRaw.city, 80),
    country: text(businessRaw.country, 80) || "Deutschland",
    email: text(businessRaw.email, 160),
    phone: text(businessRaw.phone, 40),
    register: text(businessRaw.register, 160),
    vatId: text(businessRaw.vatId, 40),
    responsiblePerson: text(businessRaw.responsiblePerson, 160),
  };
  const products = record.products.slice(0, 6).map((entry) => {
    const product = entry as Record<string, unknown>;
    const productType: ProductType = product.productType === "traditionell" ? "traditionell" : "infrarot";
    return {
      slug: text(product.slug, 80),
      stock: whole(product.stock),
      priceCents: whole(product.priceCents),
      productType,
    };
  });
  return {
    products,
    shipping,
    business,
    installationText: text(record.installationText, 2000),
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const [catalog, orders] = await Promise.all([getCatalog(), listOrders()]);
  return NextResponse.json({ catalog, orders, devPasswordHint: devPasswordHint() });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  }
  const update = parseUpdate(body);
  if (!update) return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  const error = validateAdminUpdate(update);
  if (error) return NextResponse.json({ error }, { status: 400 });
  await updateCatalog(update);
  return NextResponse.json({ ok: true });
}
