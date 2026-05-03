import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bss: {
          bg: "#0e1116",
          card: "#171b22",
          line: "#222831",
          text: "#e6edf3",
          muted: "#8b949e",
          green: "#3fb950",
          yellow: "#d29922",
          red: "#f85149",
          accent: "#58a6ff",
        },
      },
      animation: {
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
      },
      keyframes: {
        "soft-pulse": {
          "0%,100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
