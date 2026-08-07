/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F6F5F1', dark: '#121210' },
        ink: { DEFAULT: '#15150F', dark: '#F2F1EC' },
        pine: { 50: '#eef2ee', 100: '#d3ddd3', 300: '#7f9c81', 500: '#3C5E42', 600: '#2F4A35', 700: '#233729' },
        rust: { 400: '#C97A50', 500: '#B5502D', 600: '#93401F' },
        sand: { 100: '#EFE8D8', 300: '#DCCBA3' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
