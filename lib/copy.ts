import type { ProductType, PublicProduct } from "@/lib/types";

export const NEWSLETTER_CONSENT =
  "Ich willige ein, dass Badezimmer mich per E-Mail über Mini-Saunen und Angebote informiert. Die Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen. Details stehen in der Datenschutzerklärung.";

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

export function typeCopy(type: ProductType | null): { label: string; explanation: string } {
  if (type === "traditionell") {
    return {
      label: "Klassische Mini-Sauna",
      explanation: "Diese Kabine ist eine klassische Sauna mit elektrischem Saunaofen und keine Infrarotkabine.",
    };
  }
  if (type === "infrarot") {
    return {
      label: "Infrarot-Mini-Sauna",
      explanation:
        "Diese Kabine wird mit Infrarotstrahlern beheizt. Sie ist keine klassische finnische Sauna mit Saunaofen und Aufguss.",
    };
  }
  return { label: "Mini-Sauna", explanation: "" };
}

export function productDescription(product: Pick<PublicProduct, "shortDescription" | "description">): string {
  return [product.shortDescription, ...product.description].join(" ");
}

export const benefits = [
  {
    title: "Kompaktes Format",
    text: "Die Modelle sind für Wohnung, Bad oder eine ruhige Ecke im Haus gedacht.",
  },
  {
    title: "Zeitlose Gestaltung",
    text: "Holzoptik, Glas und ruhige Proportionen.",
  },
  {
    title: "Wellness zu Hause",
    text: "Ein Ort für Wärme und Ruhe im eigenen Raum. Wir machen dazu keine gesundheitlichen oder therapeutischen Versprechen.",
  },
];

export const steps = [
  {
    title: "Modell wählen",
    text: "Sechs Mini-Saunen mit festem Preis und sichtbarem Bestand.",
  },
  {
    title: "Lieferung prüfen",
    text: "Kostenlose Lieferung innerhalb Deutschlands in 0–1 Werktagen. Die Zahlung erfolgt per Nachnahme bei der Lieferung.",
  },
  {
    title: "Aufstellen und anschließen",
    text: "Aufstellung und Montage übernehmen Sie selbst. Den elektrischen Anschluss darf nur eine Elektrofachkraft vornehmen.",
  },
];

export function buildFaqs(
  products: Pick<PublicProduct, "name" | "productType">[],
  checkoutMode: "stripe" | "cod" | "inquiry" = "inquiry",
) {
  const typed = products.filter((product) => product.productType);
  const typeFaq = typed.length
    ? [
        {
          q: "Ist das eine Infrarotkabine oder eine klassische Sauna?",
          a: `Eine Infrarotkabine ist keine klassische Sauna mit Saunaofen. ${typed
            .map((product) => `${product.name}: ${typeCopy(product.productType).label}.`)
            .join(" ")}`,
        },
      ]
    : [];

  return [
    ...typeFaq,
    {
      q: "Für welche Räume sind die Kabinen gedacht?",
      a: "Kompakt Sauna One und Nordik Mini Sauna sind für kleinere Wohnungen und ruhige Ecken gedacht. Premium Relax Sauna, Panorama Mini Sauna und Aurora Panorama Mini Sauna eignen sich eher für größere Bäder, Home-Gyms oder einen eigenen Wellnessraum. Fragen zu Stellfläche und Anschluss beantworten wir gern per E-Mail an support@iwoody.de.",
    },
    {
      q: "Wo finde ich die technischen Daten?",
      a: "Auf jeder Produktseite unter „Technische Daten“. Dort stehen nur Angaben, die durch Unterlagen des Herstellers belegt sind. Fragen zu weiteren Details beantworten wir per E-Mail an support@iwoody.de.",
    },
    {
      q: "Wie hoch sind die Versandkosten?",
      a: "Der Versand per Spedition innerhalb Deutschlands ist kostenlos. Die Summe im Warenkorb und an der Kasse ist der Endpreis.",
    },
    {
      q: "Wie lange dauert die Lieferung?",
      a: "Die Lieferung innerhalb Deutschlands dauert 0–1 Werktage. Den genauen Liefertermin stimmt die Spedition vorher mit Ihnen ab.",
    },
    {
      q: "Ist die Montage enthalten?",
      a: "Nein. Aufstellung und Montage sind nicht im Preis enthalten.",
    },
    {
      q: "Wer schließt die Kabine elektrisch an?",
      a: "Den elektrischen Anschluss darf nur eine qualifizierte Elektrofachkraft vornehmen.",
    },
    {
      q: "Welche Zahlungsmöglichkeiten gibt es?",
      a:
        checkoutMode === "cod"
          ? "Sie zahlen per Nachnahme. Der Gesamtbetrag ist bei der Zustellung in bar an den Zusteller zu zahlen. Vorher wird nichts abgebucht, und es kommt kein Nachnahmezuschlag dazu."
          : checkoutMode === "stripe"
            ? "Sie zahlen auf der Seite von Stripe. Kartendaten werden in diesem Shop nicht eingegeben. Welche Methoden dort erscheinen, hängt vom Stripe-Konto ab."
            : "Eine Online-Zahlung ist derzeit nicht freigeschaltet. Das Formular erzeugt nur eine unverbindliche Anfrage.",
    },
    {
      q: "Kann ich widerrufen?",
      a: "Ja. Sie können innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen widerrufen. Sie erhalten den Kaufpreis zurück, ein Umtausch wird nicht angeboten. Ablauf, Rücksendekosten bei Sperrgut und das Musterformular stehen auf der Seite Rückgabe und Widerruf.",
    },
    {
      q: "Gibt es Bewertungen, Garantien oder Prüfzeichen?",
      a: "Es gilt die gesetzliche Gewährleistung. Eine zusätzliche Garantie bieten wir derzeit nicht an. Kundenbewertungen und Prüfzeichen zeigen wir nur, wenn sie belegt sind.",
    },
    {
      q: "Was tue ich bei einem Transportschaden?",
      a: "Vermerken Sie sichtbare Schäden bei der Annahme auf den Frachtpapieren und fotografieren Sie Verpackung und Kabine. Melden Sie den Schaden unverzüglich an support@iwoody.de. Der Ablauf steht auf der Seite Versand.",
    },
  ];
}
