import type { Metadata } from "next";
import Link from "next/link";
import { cancelPendingOrder } from "@/lib/catalog";
import { btnPrimary } from "@/components/ui";

export const metadata: Metadata = { title: "Zahlung abgebrochen", robots: { index: false, follow: false } };

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  if (order) await cancelPendingOrder(order);
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-4xl font-medium tracking-tight">Keine Zahlung ausgeführt</h1>
      <p className="mt-4 leading-relaxed text-muted">
        Der Vorgang bei Stripe wurde abgebrochen oder nicht abgeschlossen. Es wurde nichts abgebucht und nichts als bezahlt verbucht.
      </p>
      <Link href="/warenkorb" className={`${btnPrimary} mt-8`}>
        Zurück zum Warenkorb
      </Link>
    </div>
  );
}
