import { NextResponse } from "next/server";
import { recordCartAdd } from "@/lib/cart-adds";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Counts a click on "In den Warenkorb" for the add-to-cart numbers in /admin.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const slug = typeof (body as { slug?: unknown })?.slug === "string" ? (body as { slug: string }).slug.slice(0, 80) : "";
  const store = await readStore();
  if (!store.products.some((product) => product.slug === slug)) {
    return NextResponse.json({ error: "Unbekanntes Produkt." }, { status: 400 });
  }
  await recordCartAdd(slug);
  return NextResponse.json({ ok: true });
}
