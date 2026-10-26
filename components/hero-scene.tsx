// Decorative synthwave scene behind the homepage hero: sky, stars, aurora, a striped sun,
// neon mountains, a moving grid floor and a fan of holo-foil trading cards.
// Pure SVG and CSS (see globals.css); every animation stops under prefers-reduced-motion.

const cards = [
  { id: "violet", from: "#A78BFA", to: "#FF2BD6", glow: "rgba(167,139,250,0.65)", rotate: -24, x: -2, delay: 0 },
  { id: "cyan", from: "#22D3EE", to: "#34D399", glow: "rgba(34,211,238,0.6)", rotate: -12, x: -1, delay: -1.2 },
  { id: "gold", from: "#FFE08A", to: "#FF8A3D", glow: "rgba(255,201,74,0.65)", rotate: 0, x: 0, delay: -2.4 },
  { id: "pink", from: "#FF2BD6", to: "#FF5E7A", glow: "rgba(255,43,214,0.6)", rotate: 12, x: 1, delay: -3.6 },
  { id: "blue", from: "#60A5FA", to: "#A78BFA", glow: "rgba(96,165,250,0.6)", rotate: 24, x: 2, delay: -4.8 },
];

// Eight-pointed star for the card-back emblem, centred on (125, 175).
const starPoints = Array.from({ length: 16 }, (_, index) => {
  const radius = index % 2 === 0 ? 46 : 17;
  const angle = (index * Math.PI) / 8 - Math.PI / 2;
  return `${(125 + radius * Math.cos(angle)).toFixed(1)},${(175 + radius * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

const corners: Array<[number, number]> = [
  [34, 34],
  [216, 34],
  [34, 316],
  [216, 316],
];

function CardBack({ id, from, to }: { id: string; from: string; to: string }) {
  const g = `card-${id}`;
  return (
    <svg viewBox="0 0 250 350" className="block h-full w-full">
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
        <pattern id={`${g}-pt`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="#fff" strokeOpacity="0.07" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="250" height="350" rx="16" fill={`url(#${g}-bg)`} />
      <rect width="250" height="350" rx="16" fill={`url(#${g}-pt)`} />
      <rect x="8" y="8" width="234" height="334" rx="11" fill="none" stroke={`url(#${g}-ac)`} strokeWidth="3.5" />
      <rect x="19" y="19" width="212" height="312" rx="7" fill="none" stroke={`url(#${g}-ac)`} strokeWidth="1.2" opacity="0.6" />
      <circle cx="125" cy="175" r="98" fill={`url(#${g}-core)`} opacity="0.55" />
      <circle cx="125" cy="175" r="72" fill="none" stroke={`url(#${g}-ac)`} strokeWidth="2.5" />
      <circle cx="125" cy="175" r="58" fill="none" stroke={`url(#${g}-ac)`} strokeWidth="1.2" strokeDasharray="3 6" opacity="0.7" />
      <polygon points={starPoints} fill={`url(#${g}-ac)`} />
      <circle cx="125" cy="175" r="11" fill="#0A0718" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" />
      {corners.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - 9}L${x + 9} ${y}L${x} ${y + 9}L${x - 9} ${y}Z`} fill={`url(#${g}-ac)`} />
      ))}
      <path d="M60 42H190M60 308H190" stroke={`url(#${g}-ac)`} strokeWidth="1.5" opacity="0.55" />
      <path d="M95 52H155M95 298H155" stroke={`url(#${g}-ac)`} strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

export function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="scene-sky" />
      <div className="scene-stars" />
      <div className="scene-stars scene-stars--late" />
      <div className="scene-aurora" />
      <div className="scene-sun-wrap">
        <div className="scene-sun" />
      </div>
      <svg className="scene-mountains scene-mountains--back" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0 220V150L90 96L170 140L260 70L350 128L430 88L520 150L610 60L700 132L790 92L880 146L980 54L1070 120L1160 84L1250 140L1340 98L1440 130V220Z" />
      </svg>
      <svg className="scene-mountains scene-mountains--front" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ridge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="0.5" stopColor="#FF2BD6" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <path
          className="scene-ridge-fill"
          d="M0 220V170L120 120L220 168L330 104L420 160L520 132L600 176L720 110L830 172L930 128L1040 178L1150 118L1250 166L1350 136L1440 172V220Z"
        />
        <path
          className="scene-ridge"
          d="M0 170L120 120L220 168L330 104L420 160L520 132L600 176L720 110L830 172L930 128L1040 178L1150 118L1250 166L1350 136L1440 172"
          stroke="url(#ridge)"
        />
      </svg>
      <div className="scene-ground" />
      <div className="hero-floor" />
      <div className="hero-horizon" />
      <div className="card-fan">
        {cards.map((card) => (
          <div
            key={card.id}
            className="tcg"
            style={
              {
                "--r": `${card.rotate}deg`,
                "--x": card.x,
                "--d": `${card.delay}s`,
                "--glow": card.glow,
              } as React.CSSProperties
            }
          >
            <CardBack id={card.id} from={card.from} to={card.to} />
            <span className="tcg-holo" />
            <span className="tcg-glare" />
          </div>
        ))}
      </div>
      <div className="scene-shade" />
    </div>
  );
}
