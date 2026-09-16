/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        black: { DEFAULT: "#0E0812", soft: "#1B1220" },
        purple: { deep: "#3B1263", DEFAULT: "#7C3AED", mid: "#9333EA", soft: "#D9C6F7" },
        lavender: { DEFAULT: "#F4EFFB", deep: "#E9DEF7" },
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
