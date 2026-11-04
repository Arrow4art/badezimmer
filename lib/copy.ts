import type { PublicProduct } from "@/lib/types";

export const NEWSLETTER_CONSENT =
  "I agree to receive emails from Pilands Cards about products and offers. I can unsubscribe at any time. Details are in the Privacy Policy.";

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/shipping", label: "Shipping" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const legalNav = [
  { href: "/legal", label: "Business Info" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/returns", label: "Return Policy" },
  { href: "/shipping", label: "Shipping" },
  { href: "/payment", label: "Payment" },
];

export function productDescription(product: Pick<PublicProduct, "shortDescription" | "description">): string {
  return [product.shortDescription, ...product.description].join(" ");
}

export const benefits = [
  {
    title: "Factory sealed",
    text: "Displays and boxes come in their original sealed packaging.",
  },
  {
    title: "Clear prices",
    text: "Prices in USD with free US shipping. The total at checkout is what you pay.",
  },
  {
    title: "Top games",
    text: "Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! and Lorcana.",
  },
];


export function buildFaqs(
  products: Pick<PublicProduct, "name">[],
  checkoutMode: "stripe" | "inquiry" = "inquiry",
) {
  return [
    {
      q: "Which games do you carry?",
      a: "Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! and Disney Lorcana. Each product page states the contents and the edition language.",
    },
    {
      q: "Are the cards in English?",
      a: "Not always. Many products are German-language editions, and a few are Japanese. The edition is stated in the product name, so please check before you order."
    },
    {
      q: "Are products sealed?",
      a: "Yes. Displays, boxes and decks come in their original sealed packaging. The product description lists the exact contents.",
    },
    {
      q: "How much is shipping?",
      a: "Shipping within the United States is free. We cover any import duties, and no sales tax is added at checkout. The total in your cart and at checkout is your final price.",
    },
    {
      q: "How long does delivery take?",
      a: "See the Shipping page for the current delivery time. We email you tracking details as soon as your order ships.",
    },
    {
      q: "How can I pay?",
      a:
        checkoutMode === "stripe"
          ? "You pay by card in Stripe's secure form. You don't enter card details in this shop."
          : "Card payment isn't available yet. You won't be charged.",
    },
    {
      q: "Can I return an order?",
      a: "Yes. You can return an order within 14 days of delivery, no reason needed. Return shipping is free and you get the purchase price back. We don't offer exchanges. The steps are on the Return Policy page.",
    },
    {
      q: "Do you offer a warranty?",
      a: "We don't offer a separate warranty. Your rights under the law still apply. We only show customer reviews and trust seals when they're verified.",
    },
    {
      q: "What if my order arrives damaged?",
      a: "Take photos of the packaging and the contents, and email support@iwoody.de as soon as you can. The steps are on the Shipping page.",
    },
  ];
}
