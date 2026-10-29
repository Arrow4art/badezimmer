import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

/** Public key for Stripe's payment form embedded in /kasse. Without it the shop falls back to Stripe's own page. */
export function stripePublishableKey(): string | null {
  // Bracket access stays a runtime lookup, so a key set only in Vercel is not inlined as empty at build time.
  const key = process.env["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] || process.env["STRIPE_PUBLISHABLE_KEY"];
  return key?.trim().startsWith("pk_") ? key.trim() : null;
}

export function paymentConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
