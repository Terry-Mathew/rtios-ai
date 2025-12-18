/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './domains/**/*.{js,ts,jsx,tsx}',
    './shared/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './*.tsx',  // Root-level files (App.tsx, etc.)
  ],
  theme: {
    extend: {
      colors: {
        'surface-base': '#121212',
        'surface-elevated': '#1A1A1A',
        'text-primary': '#F0F0F0',
        'text-secondary': '#A3A3A3',
        'accent': '#00FF7F',
        'accent-hover': '#00CC66',
        'alert-gap': '#FF6B6B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        tiempos: ['"Playfair Display"', 'serif'],
        interstate: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

