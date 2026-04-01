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
                appBg: '#050F0A',
                neonGreen: '#00FF88',
                electricBlue: '#00C2FF',
                textPrimary: '#E8F5E9',
                textMuted: '#6B8F71',
                warning: '#FFB800',
                danger: '#FF4D4D',
            },
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
                oswald: ['Oswald', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                raleway: ['Raleway', 'sans-serif'],
                sixcaps: ['"Six Caps"', 'sans-serif'],
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
            }
        },
    },
    plugins: [],
}
