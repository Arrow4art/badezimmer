export const PRODUCTION_URL = "https://www.iwoody.de";

/** One line, US style: "123 Main St, Austin, TX 78701". Empty when no address is set. */
export function formatAddress(place: { street: string; city: string; state?: string; zip: string }): string {
  const region = [place.state, place.zip].filter(Boolean).join(" ");
  return [place.street, place.city, region].filter(Boolean).join(", ");
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured && !(process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(configured))) return configured;
  return process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000";
}
