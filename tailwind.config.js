/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'bg-light': '#f1f5f9',
                'bg-dark': '#0b1120',
                'card-light': '#ffffff',
                'card-dark': '#1e293b',
                'accent': '#22d3ee',
                'accent-hover': '#67e8f9',
            },
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
