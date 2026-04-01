/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        appBg: '#ffffff',
        surface: '#f9f9f7',
        borderColor: '#e8e8e4',
        primary: '#2d6a4f',
        secondary: '#74c69d',
        textPrimary: '#1a1a1a',
        textMuted: '#888880',
        danger: '#c0392b',
        warning: '#d4a017',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'sm': '0.125rem',
      },
      transitionDuration: {
        '150': '150ms',
      }
    },
  },
  plugins: [],
}
