/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          deep: '#0d0d14',
          mid: '#12121a',
          card: '#181828',
          elevated: '#1e1e2e',
          border: '#2a2a3a',
        },
        accent: {
          gold: '#c9a96e',
          'gold-dim': '#8a7345',
          teal: '#5e9ca0',
          'teal-bright': '#7ec4c8',
        },
        text: {
          primary: '#e8e5e0',
          secondary: '#a8a5a0',
          muted: '#6a6762',
        },
        synapse: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
