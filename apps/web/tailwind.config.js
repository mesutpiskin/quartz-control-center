/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                sage: {
                    50: '#F1F3E0',   // lightest - cream
                    100: '#D2DCB6',  // light - greenish beige
                    200: '#A1BC98',  // medium - sage green
                    300: '#778873',  // dark - deep sage
                },
            },
        },
    },
    plugins: [],
}
