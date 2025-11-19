/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Holiday Palette
        'holiday-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#c41e3a',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        'holiday-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#185c37',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'holiday-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4af37',
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
          950: '#451a03',
        },
        'holiday-cream': {
          50: '#fefdfb',
          100: '#fef5e7',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#fef5e7',
          600: '#fbbf24',
          700: '#f59e0b',
          800: '#d97706',
          900: '#b45309',
          950: '#78350f',
        },
        'holiday-silver': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#e8e8e8',
          600: '#64748b',
          700: '#475569',
          800: '#334155',
          900: '#1e293b',
          950: '#0f172a',
        },
        'holiday-dark': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#1a1a1a',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        'holiday-white': {
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
          300: '#ffffff',
          400: '#ffffff',
          500: '#ffffff',
          600: '#ffffff',
          700: '#ffffff',
          800: '#ffffff',
          900: '#ffffff',
          950: '#ffffff',
        },

        // Semantic Color Tokens
        primary: {
          DEFAULT: '#c41e3a',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#185c37',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#d4af37',
          foreground: '#1a1a1a',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#e8e8e8',
          foreground: '#1a1a1a',
        },
        background: {
          DEFAULT: '#fef5e7',
          foreground: '#1a1a1a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        border: {
          DEFAULT: '#e8e8e8',
          foreground: '#1a1a1a',
        },
        input: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        ring: {
          DEFAULT: '#d4af37',
          foreground: '#1a1a1a',
        },
      },

      // Extended Typography
      fontFamily: {
        holiday: ['Georgia', 'serif'],
        festive: ['Brush Script MT', 'cursive'],
      },

      // Enhanced Spacing
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Animation Keyframes
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        snowfall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // Animation Utilities
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        snowfall: 'snowfall 10s linear infinite',
        float: 'float 3s ease-in-out infinite',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
      },

      // Enhanced Shadows
      boxShadow: {
        holiday: '0 4px 15px rgba(196, 30, 58, 0.3)',
        'holiday-hover': '0 8px 25px rgba(196, 30, 58, 0.5)',
        'holiday-gold': '0 4px 15px rgba(212, 175, 55, 0.3)',
        'holiday-gold-hover': '0 8px 25px rgba(212, 175, 55, 0.5)',
        snow: '0 0 20px rgba(255, 255, 255, 0.8)',
        festive: '0 0 30px rgba(212, 175, 55, 0.6)',
      },

      // Enhanced Gradients
      backgroundImage: {
        'holiday-gradient': 'linear-gradient(135deg, #c41e3a 0%, #185c37 100%)',
        'holiday-gradient-reverse': 'linear-gradient(135deg, #185c37 0%, #c41e3a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
        'snow-gradient': 'linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)',
        'festive-overlay': 'linear-gradient(135deg, rgba(196, 30, 58, 0.1), rgba(24, 92, 55, 0.1))',
      },

      // Enhanced Border Radius
      borderRadius: {
        holiday: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // Custom Backdrop Filters
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
