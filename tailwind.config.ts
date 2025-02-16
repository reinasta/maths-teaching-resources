import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-fira)', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
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
  plugins: [],
};

export default config;