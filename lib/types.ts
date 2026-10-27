export type ProductImage = {
  src: string;
  alt: string;
  /** Set when the photo sits on a plain white ("light") or black ("dark") backdrop. */
  tone?: "light" | "dark";
};

export type Product = {
  slug: string;
  sku: string;
  name: string;
  priceCents: number;
  stock: number;
  shortDescription: string;
  description: string[];
  features: string[];
  targetUse: string;
  images: ProductImage[];
  /** Overrides the brand derived from the product name. */
  brand?: string;
  /** EAN/GTIN barcode from the packaging, digits only. */
  gtin?: string;
};

export type ShippingConfig = {
  destination: string;
  costCents: number;
  label: string;
  dispatchText: string;
  deliveryEstimateText: string;
  deliveryEstimateConfirmed: boolean;
  trackingAvailable: boolean;
  trackingText: string;
  bulkyGoodsText: string;
  appointmentRequired: boolean;
  appointmentText: string;
  assemblyIncluded: boolean;
  assemblyText: string;
  remoteText: string;
  damageText: string;
  reservationHours: number;
};

export type BusinessInfo = {
  legalName: string;
  owner: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  register: string;
  vatId: string;
  responsiblePerson: string;
};

export type StoreData = {
  vatRate: number;
  installationText: string;
  shipping: ShippingConfig;
  business: BusinessInfo;
  products: Product[];
};

export type PublicProduct = Product & {
  available: number;
};

export type Catalog = {
  vatRate: number;
  installationText: string;
  shipping: ShippingConfig;
  business: BusinessInfo;
  products: PublicProduct[];
  checkoutMode: "stripe" | "inquiry";
  paymentReady: boolean;
  emailReady: boolean;
};

export type OrderStatus =
  | "anfrage"
  | "zahlung_ausstehend"
  | "nachnahme"
  | "bezahlt"
  | "abgelaufen"
  | "storniert"
  | "fehlgeschlagen";

export type OrderItem = {
  slug: string;
  sku: string;
  name: string;
  qty: number;
  unitGrossCents: number;
};

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: "Deutschland";
  deliveryNote: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  shippingGrossCents: number;
  shippingLabel: string;
  vatRate: number;
  goodsGrossCents: number;
  totalGrossCents: number;
  paymentProvider: "none" | "stripe" | "cod";
  stripeSessionId?: string;
  emailSent: boolean;
  emailNote: string;
  note: string;
};

export type NewsletterEntry = {
  email: string;
  consentText: string;
  createdAt: string;
  confirmed: boolean;
  confirmationEmailSent: boolean;
};

export type AdminUpdate = {
  products: { slug: string; stock: number; priceCents: number; gtin: string }[];
  shipping: ShippingConfig;
  business: BusinessInfo;
  installationText: string;
};

export type ContactMessage = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  message: string;
  consent: boolean;
};
