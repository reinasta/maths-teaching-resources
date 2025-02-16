/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-fira)', 'sans-serif'],
      },
      colors: {
        primary: '#0072B2',
        'primary-hover': '#005580',
        'text-dark': '#333333',
        'text-muted': '#555555',
      },
    },
  },
  plugins: [],
}