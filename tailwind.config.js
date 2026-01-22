/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                montserrat: ['Montserrat', 'sans-serif'],
                oswald: ['Oswald', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                raleway: ['Raleway', 'sans-serif'],
                sixcaps: ['"Six Caps"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
