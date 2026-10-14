import Link from "next/link";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-cream" : "text-ink";
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${color}`} aria-label="Badezimmer, Startseite">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect x="3.5" y="6" width="25" height="21" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12.2 27V15.2h7.6V27" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="text-[1.2rem] font-medium tracking-tight">Badezimmer</span>
    </Link>
  );
}
