import Link from "next/link";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-4xl font-medium tracking-tight">Seite nicht gefunden</h1>
      <p className="mt-4 text-muted">Diese Adresse gehört nicht zum Shop.</p>
      <Link href="/" className={`${btnPrimary} mt-8`}>
        Zur Startseite
      </Link>
    </div>
  );
}
