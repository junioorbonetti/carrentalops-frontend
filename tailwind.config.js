/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4f9',
          100: '#b3ddef',
          200: '#80c6e5',
          300: '#4dafdb',
          400: '#4db8d4',
          500: '#1a8aaa',
          600: '#156d88',
          700: '#105066',
          800: '#0b3444',
          900: '#0d1b2a',
        },
      },
    },
  },
  plugins: [],
};
