/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        canvas: {
          light: '#FAFAFA',
          dark: '#0A0A0A',
        },
        surface: {
          card: {
            light: '#FFFFFF',
            dark: '#171717',
          },
          panel: {
            light: '#F5F5F5',
            dark: '#121212',
          },
        },
        text: {
          primary: {
            light: '#111827',
            dark: '#F9FAFB',
          },
          secondary: {
            light: '#6B7280',
            dark: '#9CA3AF',
          },
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: {
            light: '#EFF6FF',
            dark: '#1E3A8A',
          },
        },
        semantic: {
          error: '#EF4444',
          success: '#10B981',
          warning: '#F59E0B',
          info: '#3B82F6',
          ai: '#8B5CF6',
        },
        border: {
          DEFAULT: '#E5E7EB',
          active: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['KaTeX_Main', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '8px',
        md: '4px',
        sm: '2px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        float: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
