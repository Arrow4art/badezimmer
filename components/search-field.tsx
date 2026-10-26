"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { formatEUR } from "@/lib/money";

export type SearchItem = {
  slug: string;
  name: string;
  sku: string;
  kind: string;
  priceCents: number;
};

export function SearchField({
  items,
  id,
  value,
  onChange,
  placeholder,
  inputClassName,
  name,
}: {
  items: SearchItem[];
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputClassName: string;
  name?: string;
}) {
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = useMemo(() => {
    const needle = value.trim().toLocaleLowerCase("de");
    if (needle.length < 2) return [];
    return items
      .filter((item) =>
        `${item.name} ${item.sku} ${item.kind}`.toLocaleLowerCase("de").includes(needle),
      )
      .slice(0, 6);
  }, [items, value]);

  useEffect(() => {
    setActive(-1);
  }, [value]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const show = open && value.trim().length >= 2;

  return (
    <div ref={box} className="relative">
      <input
        id={id}
        name={name}
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        className={inputClassName}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!show || matches.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current) => (current + 1) % matches.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => (current <= 0 ? matches.length - 1 : current - 1));
          } else if (event.key === "Escape") {
            setOpen(false);
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            window.location.href = `/produkt/${matches[active].slug}`;
          }
        }}
      />
      {show ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-2xl border border-ink/10 bg-panel shadow-card"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">Keine passenden Produkte.</li>
          ) : (
            matches.map((item, index) => (
              <li key={item.slug} role="option" aria-selected={index === active}>
                <Link
                  href={`/produkt/${item.slug}`}
                  className={`block px-4 py-3 ${index === active ? "bg-paper" : "hover:bg-paper"}`}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className="block text-sm font-medium">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {item.kind} · {item.sku} · {formatEUR(item.priceCents)}
                  </span>
                </Link>
              </li>
            ))
          )}
          {matches.length > 0 ? (
            <li className="border-t border-ink/10">
              <Link href={`/shop?q=${encodeURIComponent(value.trim())}`} className="block px-4 py-3 text-sm text-moss">
                Alle Treffer im Shop anzeigen
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
