"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { Logo } from "@/components/logo";
import { nav } from "@/lib/copy";

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Hauptnavigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink/80 transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/warenkorb" className="relative rounded-full px-3 py-2 text-sm font-medium hover:bg-white">
            Warenkorb
            <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-forest px-1.5 py-0.5 text-xs text-cream">
              {count}
            </span>
          </Link>
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-sm md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            Menü
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-ink/10 px-5 py-3 md:hidden" aria-label="Mobile Navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-base"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
