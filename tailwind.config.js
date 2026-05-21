/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./admin/*.html",
    "./assets/js/*.js",
    "./admin/js/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'brand-copper': '#AF7A54',
        'brand-copper-light': '#D9A78B',
        'cream': '#FAF9F6',
        'dark-elegant': '#1A1A1A',
      },
      fontFamily: {
        'serif': ['"Cormorant Garamond"', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
