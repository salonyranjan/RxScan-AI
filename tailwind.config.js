/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyberblue: {
          50: "#e6fafa",
          100: "#c3eefc",
          200: "#9cdfd4",
          300: "#79cadd",
          400: "#55b5b4",
          500: "#349089",
          600: "#257f6a",
          700: "#1a5e51",
          800: "#114837",
          900: "#083622",
        },
        cyberpurple: {
          50: "#faf5ff",
          100: "#f0ebff",
          200: "#e0ccef",
          300: "#c5b1e6",
          400: "#a092d6",
          500: "#7a63c8",
          600: "#5747b7",
          700: "#3e3291",
          800: "#2e267a",
          900: "#201e54",
        },
        cyberrose: {
          50: "#ffebf8",
          100: "#ffe1ee",
          200: "#ffcae9",
          300: "#ffb2b9",
          400: "#ff98a4",
          500: "#ff6e6e",
          600: "#ff5252",
          700: "#e63946",
          800: "#f43634",
          900: "#a00a0a",
        },
        cyberemerald: {
          50: "#e6faf5",
          100: "#c3ffda",
          200: "#9cffc7",
          300: "#79ffb7",
          400: "#56ffa5",
          500: "#34ff94",
          600: "#23dc80",
          700: "#1baf72",
          800: "#157c65",
          900: "#0d5457",
        },
      },
      keyframes: {
        "cyber-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.9" },
        },
      },
      animation: {
        "cyber-pulse-infinite": "cyber-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    // Your custom medical console utility plugin safely mounted to the root level
    function ({ addUtilities }) {
      const newUtilities = {
        ".cyber-panel": {
          background: "rgba(10, 10, 12, 0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
        },
        ".border-glow-cyan": {
          border: "2px solid #00f0ff",
          boxShadow: "0 0 15px rgba(0, 240, 255, 0.25)",
        },
        ".border-glow-purple": {
          border: "2px solid #9d4edd",
          boxShadow: "0 0 15px rgba(157, 78, 221, 0.25)",
        },
        ".border-glow-rose": {
          border: "2px solid #ff0055",
          boxShadow: "0 0 25px rgba(255, 0, 85, 0.35)",
        },
        ".border-glow-emerald": {
          border: "2px solid #00ff66",
          boxShadow: "0 0 15px rgba(0, 255, 102, 0.25)",
        },
        ".border-glow-amber": {
          border: "2px solid #f7a81b",
          boxShadow: "0 0 15px rgba(247, 168, 27, 0.25)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};