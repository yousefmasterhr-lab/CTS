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
        brand: {
          50: '#EBF3F8',
          100: '#D8E3E9', // Soft Ice Canvas
          200: '#B2C9D7',
          300: '#8097AE', // Muted Steel Slate
          400: '#4A7599',
          500: '#005B96', // Primary Corporate Navy
          600: '#004C80',
          700: '#003E6B',
          800: '#002E50',
          900: '#001E35',
          navy: '#005B96',
          slate: '#8097AE',
          ice: '#D8E3E9',
          dark: '#0F172A',
          darkSurface: '#1E293B',
          darkCanvas: '#0B1120',
        },
        mint: {
          50: '#F2F8F4',
          100: '#E2F0E7',
          200: '#C7E2D2',
          300: '#A7CCB5', // Accent Success Sage Mint
          400: '#7FA88F',
          500: '#5A8F6C',
          600: '#3D714E',
        },
        danger: {
          500: '#E11D48',
        },
        warning: {
          500: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['"Alexandria"', '"Cairo"', '"Tajawal"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Alexandria"', 'monospace'],
      },
      transitionTimingFunction: {
        'mechanical': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'radar-sweep': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'stamp-imprint': {
          '0%': { transform: 'scale(2) rotate(-15deg)', opacity: '0' },
          '70%': { transform: 'scale(0.95) rotate(-3deg)', opacity: '0.9' },
          '100%': { transform: 'scale(1) rotate(-5deg)', opacity: '1' },
        }
      },
      animation: {
        'scanline': 'scanline 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'radar': 'radar-sweep 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'stamp': 'stamp-imprint 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
