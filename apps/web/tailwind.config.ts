import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // KapwaNet theme colors (can be overridden by CSS variables)
        primary: 'var(--kn-primary, #4F46E5)',
        secondary: 'var(--kn-secondary, #0EA5E9)',
        accent: 'var(--kn-accent, #F59E0B)',
        background: 'var(--kn-bg, #FFFFFF)',
        surface: 'var(--kn-surface, #F8FAFC)',
        text: 'var(--kn-text, #1E293B)',
        muted: 'var(--kn-muted, #64748B)',
      },
      fontFamily: {
        heading: ['var(--kn-font-heading, Inter)', 'sans-serif'],
        body: ['var(--kn-font-body, Inter)', 'sans-serif'],
      },
      borderRadius: {
        'kn-sm': 'var(--kn-radius-sm, 0.25rem)',
        'kn-md': 'var(--kn-radius-md, 0.5rem)',
        'kn-lg': 'var(--kn-radius-lg, 0.75rem)',
        'kn-xl': 'var(--kn-radius-xl, 1rem)',
      },
    },
  },
  plugins: [],
}

export default config
