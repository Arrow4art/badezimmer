"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { Logo } from "@/components/logo";
import { SearchField, type SearchItem } from "@/components/search-field";
import { nav } from "@/lib/copy";

export function Header({ searchItems }: { searchItems: SearchItem[] }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-5">
        <Logo />
        <form action="/shop" className="min-w-0 flex-1">
          <label htmlFor="site-search" className="sr-only">
            Produkte suchen
          </label>
          <SearchField
            items={searchItems}
            id="site-search"
            name="q"
            value={query}
            onChange={setQuery}
            placeholder="Produkte suchen"
            inputClassName="w-full rounded-full border border-ink/15 bg-white px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </form>
        <nav className="hidden items-center gap-7 text-sm lg:flex" aria-label="Hauptnavigation">
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
            className="rounded-full border border-ink/15 px-3 py-2 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            Menü
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-ink/10 px-5 py-3 lg:hidden" aria-label="Mobile Navigation">
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
