import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light text on dark surfaces.
        cream: "#F3F0FF",
        // Raised surfaces: cards, sections.
        paper: "#141029",
        // Inputs, dropdowns, secondary buttons.
        panel: "#1D1740",
        // Page background.
        night: "#0A0716",
        oak: "#FFB547",
        ink: "#ECE9FF",
        muted: "#A49FC6",
        forest: "#7C3AED",
        moss: "#22D3EE",
        neon: "#FF2BD6",
        gold: "#FFC94A",
      },
      boxShadow: {
        card: "0 24px 60px -30px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        glow: "0 0 24px -4px rgba(124, 58, 237, 0.75), 0 0 48px -12px rgba(255, 43, 214, 0.55)",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
