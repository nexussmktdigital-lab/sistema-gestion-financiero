/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        apple: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          purple: '#AF52DE',
          teal: '#5AC8FA',
          gray: {
            50: '#F5F5F7',
            100: '#E5E5EA',
            200: '#D1D1D6',
            300: '#C7C7CC',
            400: '#AEAEB2',
            500: '#8E8E93',
            600: '#636366',
            700: '#48484A',
            800: '#3A3A3C',
            900: '#1C1C1E',
          }
        }
      },
      boxShadow: {
        'apple': '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'apple-lg': '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'apple-xl': '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '18px',
        'apple-xl': '24px',
      },
      backdropBlur: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}
