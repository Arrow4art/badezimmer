import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F3EEE6",
        paper: "#FBF8F3",
        oak: "#B08968",
        ink: "#242220",
        muted: "#6B645C",
        forest: "#31493C",
        moss: "#5E7464",
      },
      boxShadow: {
        card: "0 18px 50px -28px rgba(36, 34, 32, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
