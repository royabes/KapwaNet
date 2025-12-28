import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // KapwaNet brand colors
        primary: {
          DEFAULT: '#73c91d',
          50: '#f4fce8',
          100: '#e6f7cd',
          200: '#cef0a1',
          300: '#ade56a',
          400: '#8ed63c',
          500: '#73c91d',
          600: '#569c13',
          700: '#427614',
          800: '#375e16',
          900: '#304f17',
          950: '#162c06',
        },
        // Earthy tones for wabi-sabi feel
        stone: {
          surface: '#e6e4dd',
          dark: '#2a3322',
        },
        background: {
          light: '#f7f8f6',
          dark: '#192111',
          DEFAULT: 'var(--kn-bg, #f7f8f6)',
        },
        surface: 'var(--kn-surface, #e6e4dd)',
        text: 'var(--kn-text, #1e293b)',
        muted: 'var(--kn-muted, #64748b)',
        // Legacy support
        secondary: 'var(--kn-secondary, #0EA5E9)',
        accent: 'var(--kn-accent, #F59E0B)',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'var(--kn-font-heading, Inter)', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'var(--kn-font-heading, Inter)', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'var(--kn-font-body, Inter)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        'kn-sm': 'var(--kn-radius-sm, 0.25rem)',
        'kn-md': 'var(--kn-radius-md, 0.5rem)',
        'kn-lg': 'var(--kn-radius-lg, 0.75rem)',
        'kn-xl': 'var(--kn-radius-xl, 1rem)',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
