import Link from "next/link";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-cream" : "text-ink";
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${color}`} aria-label="Iwoody, Startseite">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect x="6" y="4" width="16" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="10" y="8" width="16" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="text-[1.2rem] font-medium tracking-tight">Iwoody</span>
    </Link>
  );
}
