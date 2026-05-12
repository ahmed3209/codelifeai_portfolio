/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        fraunces: ['Fraunces', 'serif'],
      },
      colors: {
        bb: {
          black:   '#06060f',
          card:    '#0d0d1c',
          card2:   '#111122',
          white:   '#f0efe9',
          accent:  '#00d4f5',
          purple:  '#7c3aed',
          muted:   '#5a5a74',
          border:  'rgba(255,255,255,0.06)',
        }
      },
      animation: {
        'blink':          'blink 2.4s ease-in-out infinite',
        'marquee':        'marquee 28s linear infinite',
        'marquee-rev':    'marqueeRev 32s linear infinite',
        'fade-up':        'fadeUp 0.6s ease both',
        'float':          'float 6s ease-in-out infinite',
        'float-delayed':  'float 7s ease-in-out 1.5s infinite',
        'pulse-glow':     'pulseGlow 3s ease-in-out infinite',
        'spin-slow':      'spin 18s linear infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'slide-down':     'slideDown 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':       'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'border-rotate':  'borderRotate 4s linear infinite',
      },
      keyframes: {
        blink: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.25 },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        marqueeRev: {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(22px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: 0.5 },
          '50%':     { opacity: 1 },
        },
        shimmer: {
          from: { backgroundPosition: '200% center' },
          to:   { backgroundPosition: '-200% center' },
        },
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.88)' },
          to:   { opacity: 1, transform: 'scale(1)' },
        },
        borderRotate: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
