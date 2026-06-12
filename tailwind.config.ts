/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Klassga asoslangan dark mode (html-ga 'dark' klassi qo'shiladi)
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // HSL o'zgaruvchilarni Tailwind ranglariga o'giramiz
        background: 'hsl(var(--background) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        'text-main': 'hsl(var(--text-main) / <alpha-value>)',
        'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          hover: 'hsl(var(--primary-hover) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};