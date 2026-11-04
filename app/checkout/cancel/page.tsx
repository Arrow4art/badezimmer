import type { Metadata } from "next";
import Link from "next/link";
import { cancelPendingOrder } from "@/lib/catalog";
import { btnPrimary } from "@/components/ui";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Payment canceled", robots: { index: false, follow: false } };

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const cancelled = order ? await cancelPendingOrder(order) : null;
  // Close the Stripe session too, so the payment form left behind in /checkout can no longer be paid.
  if (cancelled?.status === "storniert" && cancelled.stripeSessionId) {
    try {
      await getStripe()?.checkout.sessions.expire(cancelled.stripeSessionId);
    } catch {
      // Already expired or completed. Nothing else to do.
    }
  }
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-4xl font-medium tracking-tight">No payment was made</h1>
      <p className="mt-4 leading-relaxed text-muted">
        The payment was canceled or not completed. You have not been charged.
      </p>
      <Link href="/cart" className={`${btnPrimary} mt-8`}>
        Back to cart
      </Link>
    </div>
  );
}
