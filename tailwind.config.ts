import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          50: "rgb(var(--color-cream) / <alpha-value>)",
          200: "rgb(var(--color-soft) / <alpha-value>)",
          400: "rgb(var(--color-soft) / <alpha-value>)",
          500: "rgb(var(--color-accent) / <alpha-value>)",
          600: "rgb(var(--color-accent) / <alpha-value>)",
          700: "rgb(var(--color-strong) / <alpha-value>)",
          900: "rgb(var(--color-ink) / <alpha-value>)"
        },
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        black: "rgb(var(--color-ink) / <alpha-value>)",
        white: "rgb(var(--color-paper) / <alpha-value>)",
        charcoal: "rgb(var(--color-charcoal) / <alpha-value>)",
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        "accent-readable": "rgb(var(--color-accent-text) / <alpha-value>)"
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "Arial", "sans-serif"]
      },
      letterSpacing: {
        luxury: "0.22em"
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;
