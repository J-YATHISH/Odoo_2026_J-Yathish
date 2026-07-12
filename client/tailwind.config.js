/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'neutral-bg': 'rgb(var(--color-neutral-bg) / <alpha-value>)',
        'neutral-card': 'rgb(var(--color-neutral-card) / <alpha-value>)',
        'neutral-text': 'rgb(var(--color-neutral-text) / <alpha-value>)',
        'neutral-muted': 'rgb(var(--color-neutral-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        'label-sm': ['"IBM Plex Sans Condensed"', 'sans-serif'],
        'body-md': ['"IBM Plex Sans"', 'sans-serif'],
        'headline-md': ['"IBM Plex Sans Condensed"', 'sans-serif'],
        'headline-lg': ['"IBM Plex Sans Condensed"', 'sans-serif'],
        'data-mono': ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
