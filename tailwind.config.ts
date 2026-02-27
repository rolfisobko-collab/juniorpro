import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#009FE3",      // R: 0, G: 159, B: 227
          dark: "#007BB8",        // Darker shade for hover states
          light: "#E6F4FA",        // Light shade for backgrounds
        },
        gray: {
          25: "#F8F8F8",
          50: "#F1F1F1",
          100: "#E5E5E5",
          200: "#D4D4D4",
          300: "#A8A8A8",
          400: "#9D9D9C",         // R: 157, G: 157, B: 156
          500: "#737373",
          600: "#626260",         // R: 98, G: 98, B: 96
          700: "#525252",
          800: "#3C3C3B",         // R: 60, G: 60, B: 59
          900: "#181B33",         // R: 24, G: 27, B: 51
        },
        navy: "#181B33",          // R: 24, G: 27, B: 51
        charcoal: "#3C3C3B",      // R: 60, G: 60, B: 59
        mediumGray: "#9D9D9C",    // R: 157, G: 157, B: 156
        darkGray: "#626260",      // R: 98, G: 98, B: 96
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(28px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
