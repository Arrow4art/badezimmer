import Link from "next/link";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-4xl font-medium tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">This address isn’t part of the shop.</p>
      <Link href="/" className={`${btnPrimary} mt-8`}>
        Back to home
      </Link>
    </div>
  );
}
