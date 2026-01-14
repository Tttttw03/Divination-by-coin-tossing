/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': '#2c2c2c',
        'parchment': '#f4eccd',
        'traditional-red': '#a63d33',
        'traditional-gold': '#c5a059',
      },
      fontFamily: {
        'calligraphy': ['"Ma Shan Zheng"', 'cursive'],
        'traditional': ['"Noto Serif SC"', 'serif'],
      }
    },
  },
  plugins: [],
}
