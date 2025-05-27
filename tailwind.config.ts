import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--main-font)', 'sans-serif'],
        mono: ['var(--mono-font)', 'monospace'],
      },
      colors: {
        primary: 'var(--primary-color)',
        'primary-hover': 'var(--primary-hover)',
        'text-dark': 'var(--text-dark)',
        'text-muted': 'var(--text-muted)',
        'background-light': 'var(--background-light)',
      },
    },
  },
  plugins: [typography],
};

export default config;