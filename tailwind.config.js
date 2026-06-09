/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
          light: '#fafafa',
          'light-secondary': '#ffffff',
          'light-elevated': '#f5f5f5',
        },
        border: {
          DEFAULT: '#1f1f1f',
          hover: '#2d2d2d',
          light: '#e5e5e5',
          'light-hover': '#d4d4d4',
        },
        text: {
          primary: '#ffffff',
          secondary: '#888888',
          tertiary: '#555555',
          'light-primary': '#0a0a0a',
          'light-secondary': '#525252',
          'light-tertiary': '#a3a3a3',
        },
        // Only for tiny accents (dots, small icons)
        accent: {
          blue: '#5e6ad2',
          green: '#10b981',
          purple: '#8b5cf6',
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
