import Link from "next/link";

export const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream transition hover:bg-[#283d32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-45";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-45";

export const btnLight =
  "inline-flex items-center justify-center rounded-full border border-cream/50 px-5 py-3 text-sm font-medium text-cream transition hover:bg-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

export const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-ink/15 bg-white px-3.5 py-3 text-ink outline-none placeholder:text-muted/70 focus:border-forest focus:ring-2 focus:ring-forest/20";

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-moss">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
        {lede ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lede}</p> : null}
      </div>
    </header>
  );
}

export function Placeholder({ value, label }: { value?: string; label: string }) {
  if (value?.trim()) return <>{value}</>;
  return <span className="italic text-oak">[{label} noch einzutragen]</span>;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
      {children}
    </Link>
  );
}
