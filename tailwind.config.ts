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
          50: "#f4efeb",
          200: "#c8b2a4",
          500: "#76513f",
          700: "#4a2f24",
          900: "#241611"
        },
        ink: "#050505",
        charcoal: "#1b1b1b",
        cream: "#f4f0e8",
        paper: "#fbfaf7"
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
