import scrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        "logisync-color-blue": {
          50: "#0b61e9",
          100: "#0852d6",
          200: "#0644c3",
          300: "#0335b0",
          400: "#00269d",
        },
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [
    scrollbar,
    require('flowbite/plugin'),
  ],
}
