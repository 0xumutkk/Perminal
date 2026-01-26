import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#f9fafb",
        "card-bg": "#020617",
        "card-muted": "#020617",
        accent: {
          DEFAULT: "#6366f1"
        },
        yes: "#22c55e",
        no: "#ef4444"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
};

export default config;

