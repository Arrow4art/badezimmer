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

export function typeCopy(type: ProductType): { label: string; explanation: string } {
  if (type === "traditionell") {
    return {
      label: "Klassische Mini-Sauna",
      explanation:
        "Dieses Modell ist als klassische Mini-Sauna eingeordnet, nicht als Infrarotkabine. Ein Saunaofen, die Heizleistung und der elektrische Anschluss gelten erst dann als angegeben, wenn der Lieferant sie bestätigt hat. Bis dahin stehen diese Punkte auf der Seite als offen.",
    };
  }
  return {
    label: "Infrarot-Mini-Sauna",
    explanation:
      "Dieses Modell ist als Infrarot-Mini-Sauna eingeordnet. Es ist keine klassische finnische Sauna mit Saunaofen und Aufguss. Heiztechnik, Leistung und elektrischer Anschluss sind vom Lieferanten noch nicht bestätigt und deshalb nicht als geprüfte Technikdaten ausgewiesen.",
  };
}

export function specStatusLabel(status: "verified" | "illustrative" | "unconfirmed"): string {
  if (status === "verified") return "Bestätigt";
  if (status === "illustrative") return "Unverbindliche Darstellung";
  return "Noch nicht bestätigt";
}

export const benefits = [
  {
    title: "Kompaktes Format",
    text: "Die Modelle sind für Wohnung, Bad oder eine ruhige Ecke im Haus gedacht. Ob der Platz wirklich reicht, hängt von den noch offenen Maßen ab.",
  },
  {
    title: "Zeitlose Gestaltung",
    text: "Helles Holz, Glas und ruhige Proportionen. Die Bilder zeigen das Gestaltungskonzept, nicht eine bereits vermessene Serie.",
  },
  {
    title: "Wellness zu Hause",
    text: "Ein Ort für Wärme und Ruhe im eigenen Raum. Wir machen dazu keine gesundheitlichen oder therapeutischen Versprechen.",
  },
];

export const steps = [
  {
    title: "Modell wählen",
    text: "Sechs Mini-Saunen mit festem Preis, sichtbarem Bestand und einer klaren Produktart.",
  },
  {
    title: "Lieferung prüfen",
    text: "Kostenlose Lieferung innerhalb Deutschlands in 0–1 Werktagen. Lieferhinweise stehen vor dem Absenden.",
  },
  {
    title: "Aufstellen und anschließen",
    text: "Montage und Elektroanschluss richten sich nach der aktuellen Konfiguration und den noch offenen Herstellerangaben.",
  },
];

export function buildFaqs(products: Pick<PublicProduct, "name" | "productType">[]) {
  const typeLines = products
    .map((product) => `${product.name}: ${typeCopy(product.productType).label}`)
    .join(" ");

  return [
    {
      q: "Ist das eine Infrarotkabine oder eine klassische Sauna?",
      a: `Die Produktart steht auf jeder Produktseite und wird nicht vermischt. Eine Infrarot-Mini-Sauna ist keine klassische Sauna mit Saunaofen. Eine klassische Mini-Sauna ist keine Infrarotkabine. Aktuell: ${typeLines} Die konkrete Heiztechnik bleibt offen, bis der Lieferant sie bestätigt.`,
    },
    {
      q: "Für welche Räume sind die Kabinen gedacht?",
      a: "Kompakt Sauna One und Nordik Mini Sauna sind für kleinere Wohnungen und ruhige Ecken vorgesehen. Premium Relax Sauna und Panorama Mini Sauna sind für größere Bäder, Home-Gyms oder einen eigenen Wellnessraum gedacht. Ob eine Kabine passt, hängt von den noch nicht bestätigten Maßen, vom Boden und vom elektrischen Anschluss ab.",
    },
    {
      q: "Sind Maße und Materialien verbindlich?",
      a: "Nein. Maße, Holzart, Glas, Beleuchtung und Lieferumfang sind auf den Produktseiten als unverbindliche Darstellung oder als offene Angabe gekennzeichnet, bis der Lieferant sie bestätigt.",
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
      a: "Nur wenn der Shop das ausdrücklich so konfiguriert. Im Ausgangszustand ist die Montage nicht enthalten.",
    },
    {
      q: "Wer schließt die Kabine elektrisch an?",
      a: "Anschlusswerte liegen noch nicht vor. Die Kabine darf erst angeschlossen werden, wenn die Herstellerangaben da sind, und nur durch eine qualifizierte Elektrofachkraft.",
    },
    {
      q: "Welche Zahlungsmöglichkeiten gibt es?",
      a: "Kartendaten werden in diesem Shop nicht eingegeben und nicht gespeichert. Ist Stripe konfiguriert, zahlen Sie auf der Seite von Stripe. Welche Methoden dort erscheinen, hängt vom Stripe-Konto ab, üblicherweise Karte, Klarna, PayPal und SEPA-Lastschrift. Ohne konfigurierten Anbieter wird keine Zahlung ausgeführt und nichts als bezahlt verbucht.",
    },
    {
      q: "Kann ich widerrufen?",
      a: "Ja. Sie können innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen widerrufen. Sie erhalten den Kaufpreis zurück, ein Umtausch wird nicht angeboten. Ablauf, Rücksendekosten bei Sperrgut und das Musterformular stehen auf der Seite Rückgabe und Widerruf.",
    },
    {
      q: "Gibt es Bewertungen, Garantien oder Prüfzeichen?",
      a: "Nein. Der Shop zeigt keine Kundenbewertungen, keine zusätzliche Garantie, keine Zertifikate und keine Energieeffizienzangaben, solange solche Nachweise nicht vorliegen.",
    },
    {
      q: "Was tue ich bei einem Transportschaden?",
      a: "Vermerken Sie sichtbare Schäden bei der Annahme auf den Frachtpapieren und fotografieren Sie Verpackung und Kabine. Melden Sie den Schaden unverzüglich an support@iwoody.de. Der Ablauf steht auf der Seite Versand.",
    },
  ];
}
