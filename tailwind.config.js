/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fontaine: {
          950: '#050811',
          900: '#090f21',
          800: '#0f1c3d',
          700: '#162957',
          600: '#213d7d',
          hydro: '#4dc5f9',
          cyan: '#6be5ff',
          glow: '#9ae8ff',
          accent: '#2a5b9e'
        }
      }
    },
  },
  plugins: [],
}
