/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111111",
        accent: "#C9A84C",
        textPrimary: "#FFFFFF",
        textSecondary: "#A0A0A0",
        card: "#1E1E1E",
        border: "#2A2A2A",
        success: "#4CAF50",
        warning: "#FFC107",
        error: "#F44336",
      },
    },
  },
  plugins: [],
};