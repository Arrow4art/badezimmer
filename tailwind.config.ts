import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#EEF1F6",
        paper: "#F7F8FB",
        oak: "#9A4A3A",
        ink: "#16181D",
        muted: "#5C6370",
        forest: "#1E2A4A",
        moss: "#3E5C8A",
      },
      boxShadow: {
        card: "0 18px 50px -28px rgba(36, 34, 32, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
