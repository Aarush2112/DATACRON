const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        bg: '#03050a',
        glow: '#00FF9F',
        accent: '#00D4AA',
        gold: '#FFD700',
      },
      fontFamily: {
        heading: ['Orbitron', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero-title': 'clamp(42px, 10vw, 110px)',
        'hero-subtitle': 'clamp(16px, 2.4vw, 22px)',
        'section-title': 'clamp(24px, 3.2vw, 36px)',
        'countdown-val': 'clamp(32px, 5vw, 48px)',
      },
      animation: {
        'flicker': 'flicker 1.8s infinite alternate ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { 
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.26), 0 0 20px rgba(255, 69, 0, 0.5), 0 0 35px rgba(255, 215, 0, 0.2)',
            filter: 'drop-shadow(0 0 12px rgba(255, 69, 0, 0.4))'
          },
          '50%': { 
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.26), 0 0 35px rgba(255, 215, 0, 0.7), 0 0 50px rgba(255, 69, 0, 0.3)',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))'
          },
        }
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.data-heist-card': {
          '@apply animate-flicker': {},
          'border': '1px solid rgba(255, 140, 0, 0.3)',
          'background': 'rgba(255, 255, 255, 0.03)',
          'will-change': 'transform, box-shadow',
        },
      })
    })
  ],
}
