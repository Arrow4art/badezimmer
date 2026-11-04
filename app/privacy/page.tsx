import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatAddress } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy Policy" lede="What personal information this shop collects, why, and your choices." />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Who we are</h2>
          <p className="mt-3">
            Pilands Cards, <Placeholder value={formatAddress(business)} label="Business address" />,{" "}
            <Placeholder value={business.email} label="Email" />.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Orders: name, email, phone number if you give it, shipping address, items and order status.</li>
            <li>Contact form: name, email and your message.</li>
            <li>Newsletter: your email, the consent wording you agreed to, and the time.</li>
            <li>Technical data: IP address, time of visit, page visited, referring page, browser, device type, operating system and country.</li>
          </ul>
          <p className="mt-3">We don’t collect or store card numbers, security codes or expiration dates. You enter those directly with Stripe.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">How we use it</h2>
          <p className="mt-3">
            We use this information to fulfill orders, answer messages, send emails you asked for, keep the shop secure, understand
            how the shop is used, and meet legal obligations. We keep order records as long as tax and accounting rules require, and
            messages until they are resolved.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Who we share it with</h2>
          <p className="mt-3">We share information only with the service providers that run the shop:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Vercel: website hosting and privacy-friendly visitor statistics, with no cookies and no cross-site profiles.</li>
            <li>Upstash: the database for orders, messages and newsletter sign-ups.</li>
            <li>Stripe: payment processing. Stripe handles payment data under its own privacy policy at stripe.com/privacy.</li>
            <li>Resend: delivery of order and service emails.</li>
            <li>Telegram: order alerts to the shop owner, including name, contact details, address, items and amount.</li>
            <li>Google: ad measurement and review surveys, as described below.</li>
            <li>Shipping carriers: the name and address needed to deliver your order.</li>
          </ul>
          <p className="mt-3">We don’t sell your personal information for money. Some of these providers may process data outside your state or the United States.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Cookies and advertising choices</h2>
          <p className="mt-3">
            Your cart is kept in your browser. The admin area uses a necessary session cookie. Google Ads measurement and personalized
            advertising storage stay off unless you click “Accept” in the notice, and “Decline” keeps them off. Your choice is saved in
            this browser. Sharing data for targeted ads may count as “sharing” under some state laws, and declining opts you out in this
            browser. We also count how many times each product is added to a cart, per day, with no link to any person.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Google Customer Reviews</h2>
          <p className="mt-3">
            If you clicked “Accept”, a Google Customer Reviews window may appear after a paid order. We pass it your order number, email,
            delivery country and estimated delivery date. Google emails you a survey only if you agree in that window.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Newsletter</h2>
          <p className="mt-3">Newsletter emails go out only if you opted in. You can unsubscribe at any time by contacting us through the contact form.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Your privacy rights</h2>
          <p className="mt-3">
            Depending on where you live, including California and other states with privacy laws, you may have the right to know what
            personal information we hold, get a copy, correct or delete it, and opt out of targeted advertising. To make a request, email{" "}
            <Placeholder value={business.email} label="Email" />. We’ll verify your request and won’t treat you differently for making it.
            California residents can also use this address for “Shine the Light” requests.
          </p>
          <p className="mt-3">
            If you’re in the EU, EEA or UK, you also have GDPR rights to access, correct, delete, restrict or port your data, to object to
            processing, to withdraw consent, and to complain to a data protection authority.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Children</h2>
          <p className="mt-3">This shop isn’t directed to children under 13, and we don’t knowingly collect their personal information. If you believe a child gave us information, contact us and we’ll delete it.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Security and changes</h2>
          <p className="mt-3">The whole site uses encrypted HTTPS connections, though no system is perfectly secure. If we change this policy, we’ll post the new version here.</p>
        </section>
      </div>
    </>
  );
}
