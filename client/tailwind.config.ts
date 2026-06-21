import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1525",
        "ink-soft": "#1C2740",
        indigo: "#4F46E5",
        "indigo-tint": "#EEF0FF",
        coral: "#FF7A66",
        "coral-tint": "#FFF0EC",
        emerald: "#12B886",
        amber: "#F5A524",
        rose: "#F43F5E",
        canvas: "#F7F8FB",
        surface: "#FFFFFF",
        border: "#E6E9F0",
        "text-muted": "#64748B",
      },
      fontFamily: {
        display: ["Clash Display", "General Sans", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        input: "12px",
        button: "12px",
        card: "16px",
        sheet: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 21, 37, 0.04), 0 8px 24px rgba(14, 21, 37, 0.06)",
        "card-hover": "0 4px 6px rgba(14, 21, 37, 0.06), 0 12px 32px rgba(14, 21, 37, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
