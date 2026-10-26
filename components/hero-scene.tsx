// Decorative synthwave scene behind the homepage hero: sky, stars, aurora, a striped sun,
// neon mountains and a moving grid floor. The clickable card fan lives in card-fan.tsx.
// Pure SVG and CSS (see globals.css); every animation stops under prefers-reduced-motion.

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
      <div className="scene-shade" />
    </div>
  );
}
