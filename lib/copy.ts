import type { PublicProduct } from "@/lib/types";

export const NEWSLETTER_CONSENT =
  "Ich willige ein, dass Iwoody mich per E-Mail über das Sortiment und Angebote informiert. Die Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen. Details stehen in der Datenschutzerklärung.";

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/versand", label: "Versand" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

export const legalNav = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
  { href: "/versand", label: "Versand" },
  { href: "/zahlung", label: "Zahlung" },
];

export function productDescription(product: Pick<PublicProduct, "shortDescription" | "description">): string {
  return [product.shortDescription, ...product.description].join(" ");
}

export const benefits = [
  {
    title: "Versiegelt",
    text: "Displays und Boxen werden originalverpackt angeboten.",
  },
  {
    title: "Klare Preise",
    text: "Jeder Preis enthält die Mehrwertsteuer. Der Versand steht vor dem Abschluss.",
  },
  {
    title: "Mehrere Spiele",
    text: "Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! und Lorcana.",
  },
];

export const steps = [
  {
    title: "Produkt wählen",
    text: "Displays, Boxen und Decks mit festem Preis, ab Lager.",
  },
  {
    title: "Lieferung prüfen",
    text: "Kostenlose Lieferung innerhalb Deutschlands in 0–3 Werktagen. Die Zahlung erfolgt per Karte über Stripe.",
  },
  {
    title: "Versiegelt erhalten",
    text: "Die Ware kommt originalverpackt und versiegelt.",
  },
];

export function buildFaqs(
  products: Pick<PublicProduct, "name">[],
  checkoutMode: "stripe" | "inquiry" = "inquiry",
) {
  return [
    {
      q: "Welche Spiele sind im Sortiment?",
      a: "Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! und Disney Lorcana. Sprache und Inhalt stehen auf der jeweiligen Produktseite.",
    },
    {
      q: "Sind die Produkte versiegelt?",
      a: "Ja. Displays, Boxen und Decks werden originalverpackt angeboten. Der genaue Inhalt steht in der Produktbeschreibung.",
    },
    {
      q: "Wie hoch sind die Versandkosten?",
      a: "Der Versand innerhalb Deutschlands ist kostenlos. Die Summe im Warenkorb und an der Kasse ist der Endpreis.",
    },
    {
      q: "Wie lange dauert die Lieferung?",
      a: "Die Lieferung innerhalb Deutschlands dauert 0–3 Werktage.",
    },
    {
      q: "Welche Zahlungsmöglichkeiten gibt es?",
      a:
        checkoutMode === "stripe"
          ? "Sie zahlen auf der Seite von Stripe. Kartendaten werden in diesem Shop nicht eingegeben. Nachnahme gibt es nicht."
          : "Kartenzahlung über Stripe ist derzeit nicht freigeschaltet. Nachnahme gibt es nicht. Es wird nichts abgebucht.",
    },
    {
      q: "Kann ich widerrufen?",
      a: "Ja. Sie können innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen widerrufen. Sie erhalten den Kaufpreis zurück, ein Umtausch wird nicht angeboten. Ablauf und Musterformular stehen auf der Seite Rückgabe und Widerruf.",
    },
    {
      q: "Gibt es Bewertungen, Garantien oder Prüfzeichen?",
      a: "Es gilt die gesetzliche Gewährleistung. Eine zusätzliche Garantie bieten wir derzeit nicht an. Kundenbewertungen und Prüfzeichen zeigen wir nur, wenn sie belegt sind.",
    },
    {
      q: "Was tue ich bei einem Transportschaden?",
      a: "Vermerken Sie sichtbare Schäden bei der Annahme und fotografieren Sie Verpackung und Inhalt. Melden Sie den Schaden unverzüglich an support@iwoody.de. Der Ablauf steht auf der Seite Versand.",
    },
  ];
}
