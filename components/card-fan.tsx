"use client";

// The hero's fan of holo-foil cards. Each card links to one game's products in the shop.
// Cards lift as the pointer comes near, tilt toward it on hover, and the glare follows it.
// Pointer effects only run for a mouse and never under prefers-reduced-motion.

import Link from "next/link";
import { useEffect, useRef } from "react";

const cards = [
  { id: "magic", logo: "/images/brands/magic.webp", label: "Magic", query: "Magic: The Gathering", from: "#A78BFA", to: "#FF2BD6", glow: "rgba(167,139,250,0.65)", rotate: -24, x: -2, delay: 0 },
  { id: "yugioh", logo: "/images/brands/yugioh.webp", label: "Yu-Gi-Oh!", query: "Yu-Gi-Oh", from: "#60A5FA", to: "#A78BFA", glow: "rgba(96,165,250,0.6)", rotate: -12, x: -1, delay: -1.2 },
  { id: "pokemon", logo: "/images/brands/pokemon.webp", label: "Pokémon", query: "Pokémon", from: "#FFE08A", to: "#FF6B3D", glow: "rgba(255,201,74,0.65)", rotate: 0, x: 0, delay: -2.4 },
  { id: "onepiece", logo: "/images/brands/onepiece.webp", label: "One Piece", query: "One Piece", from: "#FF7A7A", to: "#FF2BD6", glow: "rgba(255,90,120,0.6)", rotate: 12, x: 1, delay: -3.6 },
  { id: "lorcana", logo: "/images/brands/lorcana.webp", label: "Lorcana", query: "Lorcana", from: "#38BDF8", to: "#FFD36B", glow: "rgba(56,189,248,0.6)", rotate: 24, x: 2, delay: -4.8 },
];

const corners: Array<[number, number]> = [
  [34, 34],
  [216, 34],
  [34, 316],
  [216, 316],
];

function CardBack({ id, label, logo, from, to }: { id: string; label: string; logo: string; from: string; to: string }) {
  const g = `card-${id}`;
  return (
    <svg viewBox="0 0 250 350" className="block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${g}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1F1450" />
          <stop offset="1" stopColor="#0A0718" />
        </linearGradient>
        <linearGradient id={`${g}-ac`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <radialGradient id={`${g}-core`}>
          <stop offset="0" stopColor={from} stopOpacity="0.75" />
          <stop offset="1" stopColor={to} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${g}-halo`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${g}-pt`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="#fff" strokeOpacity="0.07" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="250" height="350" rx="16" fill={`url(#${g}-bg)`} />
      <rect width="250" height="350" rx="16" fill={`url(#${g}-pt)`} />
      <rect x="8" y="8" width="234" height="334" rx="11" fill="none" stroke={`url(#${g}-ac)`} strokeWidth="3.5" />
      <rect x="19" y="19" width="212" height="312" rx="7" fill="none" stroke={`url(#${g}-ac)`} strokeWidth="1.2" opacity="0.6" />
      <circle cx="125" cy="165" r="96" fill={`url(#${g}-core)`} opacity="0.55" />
      {/* Soft light behind the logo so dark lettering still reads on the dark card. */}
      <ellipse cx="125" cy="165" rx="112" ry="66" fill={`url(#${g}-halo)`} />
      <image href={logo} x="20" y="112" width="210" height="106" preserveAspectRatio="xMidYMid meet" />
      {corners.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - 9}L${x + 9} ${y}L${x} ${y + 9}L${x - 9} ${y}Z`} fill={`url(#${g}-ac)`} />
      ))}
      {/* Top-left, the part of each card the fan leaves visible. */}
      <rect x="22" y="22" width={label.length * 15 + 34} height="40" rx="20" fill="#0A0718" fillOpacity="0.8" stroke={`url(#${g}-ac)`} strokeWidth="2" />
      <text
        x="39"
        y="49"
        textAnchor="start"
        fill="#fff"
        fontSize="24"
        fontWeight="700"
        letterSpacing="0.5"
        fontFamily="inherit"
      >
        {label}
      </text>
    </svg>
  );
}

export function CardFan() {
  const fanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fan = fanRef.current;
    if (!fan) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const items = Array.from(fan.querySelectorAll<HTMLElement>(".tcg"));
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const update = () => {
      frame = 0;
      for (const item of items) {
        const box = item.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const near = Math.max(0, 1 - Math.hypot(pointerX - centerX, pointerY - centerY) / 280);
        // Rotated neighbours overlap each other's boxes, so only the card under the pointer tilts.
        const inside = item.matches(":hover");
        const offsetX = Math.max(-1, Math.min(1, (pointerX - centerX) / (box.width / 2)));
        const offsetY = Math.max(-1, Math.min(1, (pointerY - centerY) / (box.height / 2)));
        item.style.setProperty("--near", near.toFixed(3));
        item.style.setProperty("--tilt-x", `${inside ? offsetY * -12 : 0}deg`);
        item.style.setProperty("--tilt-y", `${inside ? offsetX * 14 : 0}deg`);
        item.style.setProperty("--glare-x", `${((offsetX + 1) / 2) * 100}%`);
        item.style.setProperty("--glare-y", `${((offsetY + 1) / 2) * 100}%`);
      }
    };

    const reset = () => {
      for (const item of items) {
        for (const name of ["--near", "--tilt-x", "--tilt-y", "--glare-x", "--glare-y"]) item.style.removeProperty(name);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (reduceMotion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav ref={fanRef} className="card-fan" aria-label="Nach Spiel einkaufen">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/shop?q=${encodeURIComponent(card.query)}`}
          className="tcg"
          aria-label={`${card.label}: Produkte ansehen`}
          style={
            {
              "--r": `${card.rotate}deg`,
              "--x": card.x,
              "--d": `${card.delay}s`,
              "--glow": card.glow,
            } as React.CSSProperties
          }
        >
          <span className="tcg-card">
            <CardBack id={card.id} label={card.label} logo={card.logo} from={card.from} to={card.to} />
            <span className="tcg-holo" />
            <span className="tcg-glare" />
            <span className="tcg-cta" aria-hidden="true">
              Ansehen →
            </span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
