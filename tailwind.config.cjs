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
        'surface-overlay': '#242424',
        'text-primary': '#F0F0F0',
        'text-secondary': '#B8B8B8', // Increased from #A3A3A3 for WCAG AA (7.2:1 contrast)
        'text-tertiary': '#888888',
        'text-placeholder': '#9A9A9A', // For input placeholders (5.3:1 contrast)
        'accent': '#00FF7F',
        'accent-hover': '#00CC66',
        'accent-muted': 'rgba(0, 255, 127, 0.1)',
        'alert-gap': '#FF6B6B',
        'alert-warning': '#FFB347',
        'alert-success': '#4ADE80',
        'border-subtle': 'rgba(255, 255, 255, 0.05)',
        'border-default': 'rgba(255, 255, 255, 0.1)',
        'border-focus': '#00FF7F',
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

