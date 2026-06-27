/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#111111',
          elevated: '#1a1a1a',
        },
        border: {
          DEFAULT: '#1f1f1f',
          hover: '#2d2d2d',
        },
        text: {
          primary: '#ffffff',
          secondary: '#888888',
          tertiary: '#555555',
        },
        // Signature accent + vibrant secondary palette (from color-ref).
        // `accent` (no suffix) is the app-wide signature color — it powers
        // active nav, focus rings, avatars, notification dots, links, etc.
        accent: {
          DEFAULT: '#c7f751', // signature lime
          hover: '#d6fb6e',
          muted: '#a9d63f',
          // Secondary palette — use as solid pills / tints in dark mode
          lime: '#c7f751',
          coral: '#ff7a59',
          lavender: '#b8a6ff',
          // Semantic accents (existing usage)
          blue: '#5e6ad2',
          green: '#10b981',
          purple: '#b8a6ff',
          sky: '#06b6d4',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: '11px',
        sm: '13px',
        base: '14px',
        md: '15px',
        lg: '18px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
        '5xl': '64px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        md: '0 4px 12px rgba(0, 0, 0, 0.6)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.7)',
        'inner-lg': 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
        'gradient-dark': 'linear-gradient(to bottom, #000000 0%, #0a0a0a 50%, #111111 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      },
    },
  },
  plugins: [],
}
