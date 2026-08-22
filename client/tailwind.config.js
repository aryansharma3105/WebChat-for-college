/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Red Theme Primary Accent Palette
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Deep Obsidian & Dark Charcoal Palette
        dark: {
          950: '#07080b', // Ultra deep cosmic black
          900: '#0c0d12', // Core body background
          850: '#12141c', // Sidebar & Navbar surface
          800: '#181b26', // Cards & Container surface
          750: '#202434', // Secondary containers & active hover
          700: '#2b3044', // Borders & dividers
          600: '#3c435e',
        },
        slate: {
          750: '#181b26',
          850: '#12141c',
        }
      },
      boxShadow: {
        'red-glow': '0 0 25px -3px rgba(239, 68, 68, 0.28)',
        'red-glow-sm': '0 0 15px -3px rgba(239, 68, 68, 0.2)',
        'red-glow-lg': '0 0 45px -5px rgba(239, 68, 68, 0.45)',
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'inner-red': 'inset 0 1px 0 0 rgba(239, 68, 68, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.15), transparent 70%)',
        'radial-glow-corner': 'radial-gradient(circle at 100% 100%, rgba(220, 38, 38, 0.12), transparent 60%)',
        'gradient-red': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
      }
    },
  },
  plugins: [],
}
