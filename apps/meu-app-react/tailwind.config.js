/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./apps/meu-app-react/index.html",
    "./apps/meu-app-react/src/**/*.{js,ts,jsx,tsx}",
    "./packages/background-remover/src/**/*.{js,ts,jsx,tsx}",
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
