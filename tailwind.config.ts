import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#111508",
        "surface-container": "#1d2113",
        "surface-container-low": "#191d10",
        "surface-container-lowest": "#0c0f04",
        "surface-container-high": "#282c1d",
        "on-surface": "#e1e4cf",
        "on-surface-variant": "#c3caac",
        neon: "#C6FF00",
        "neon-dim": "#a6d700",
        "on-neon": "#050505",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        glass: "24px",
        pill: "9999px",
      },
      boxShadow: {
        neon: "0 0 30px #C6FF0026",
        "neon-lg": "0 0 40px #C6FF0040",
        "neon-btn": "0 0 20px #C6FF004D",
      },
    },
  },
  plugins: [],
};

export default config;
