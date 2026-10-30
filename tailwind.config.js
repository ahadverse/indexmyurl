const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      // one accent colour for the whole app; change it here to re-brand
      colors: { brand: colors.indigo },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.05)',
        pop: '0 12px 32px -12px rgb(15 23 42 / 0.28), 0 2px 6px -2px rgb(15 23 42 / 0.08)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'none' },
        },
        stripes: {
          from: { backgroundPosition: '1.25rem 0' },
          to: { backgroundPosition: '0 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-in': 'fade-in 0.3s ease-out both',
        'pop-in': 'pop-in 0.15s ease-out both',
        'toast-in': 'toast-in 0.2s ease-out both',
        stripes: 'stripes 0.9s linear infinite',
      },
    },
  },
  plugins: [],
}
