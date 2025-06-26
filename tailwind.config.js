/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "premium-yellow": "#FFD600",
        "premium-gold": "#FFC107",
        "premium-brown": "#5D4037",
        "premium-dark": "#2D221B",
        "premium-accent": "#FF7043",
      },
    },
  },
  plugins: [],
}; 