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
    },
  },
  plugins: [],
}
