/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '10px',
        sm: '300px',
        md: '400px',
        lg: '600px',
      }
    },
  },
  plugins: [],
}

