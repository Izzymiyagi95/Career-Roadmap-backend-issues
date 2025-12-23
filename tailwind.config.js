/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // ← Add this
    "./public/index.html"          // ← And this
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}