/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
    "./src/frontend/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1db954',
        secondary: '#191414',
        accent: '#535353',
        background: '#000000',
        surface: '#181818',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
