// Fixed, decorative layer behind every page: drifting neon glows, twinkling stars, a faint grid and rising sparks.
// Pure CSS (see globals.css), so it costs no JavaScript and stops under prefers-reduced-motion.

const particles = [
  { left: "6%", color: "#22D3EE", duration: 19, delay: -3 },
  { left: "14%", color: "#FF2BD6", duration: 24, delay: -11 },
  { left: "23%", color: "#FFC94A", duration: 21, delay: -6 },
  { left: "34%", color: "#A78BFA", duration: 27, delay: -17 },
  { left: "45%", color: "#22D3EE", duration: 22, delay: -9 },
  { left: "57%", color: "#FF2BD6", duration: 26, delay: -1 },
  { left: "66%", color: "#A78BFA", duration: 20, delay: -14 },
  { left: "75%", color: "#FFC94A", duration: 25, delay: -8 },
  { left: "84%", color: "#22D3EE", duration: 23, delay: -19 },
  { left: "93%", color: "#FF2BD6", duration: 28, delay: -4 },
];

export function Backdrop() {
  return (
    <div className="fx-backdrop" aria-hidden="true">
      <div className="fx-aurora fx-aurora--violet" />
      <div className="fx-aurora fx-aurora--cyan" />
      <div className="fx-aurora fx-aurora--pink" />
      <div className="fx-stars" />
      <div className="fx-stars fx-stars--late" />
      <div className="fx-grid" />
      {particles.map((particle) => (
        <span
          key={particle.left}
          className="fx-particle"
          style={{
            left: particle.left,
            color: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
