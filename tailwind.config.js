/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fontaine: {
          950: '#030712',
          900: '#060d24',
          850: '#08122c',
          800: '#0f1c3d',
          700: '#162957',
          600: '#213d7d',
          hydro: '#38bdf8',
          cyan: '#67e8f9',
          glow: '#9ae8ff',
          royal: '#2563eb',
          accent: '#2a5b9e'
        },
        cozy: {
          amber: '#f59e0b',
          peach: '#fb923c',
          rose: '#f43f5e',
          violet: '#a855f7',
          warmNight: '#030712',
          card: '#08122c',
          cardHover: '#0e1c45'
        }
      },
      animation: {
        'spotlight': 'spotlight 2s ease 0.2s 1 forwards',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'shine': 'shine 8s ease-in-out infinite',
        'marquee': 'marquee var(--duration, 30s) linear infinite',
        'ripple': 'ripple var(--duration, 2s) ease calc(var(--i, 0)*.2s) infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        shine: {
          '0%': { 'background-position': '0% 0%' },
          '50%': { 'background-position': '100% 100%' },
          'to': { 'background-position': '0% 0%' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap, 1rem)))' },
        },
        ripple: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(0.92)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
