import path from 'path';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    path.join(__dirname, '../../packages/background-remover/src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-up': 'scaleUp 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        },
        scaleUp: {
          'from': { transform: 'scale(0.95)', opacity: 0 },
          'to': { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
