module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Inclut les fichiers TypeScript dans le dossier app/
    './pages/**/*.{js,ts,jsx,tsx}', // Inclut les fichiers TypeScript dans le dossier pages/ (si utilisé)
    './components/**/*.{js,ts,jsx,tsx}', // Inclut les fichiers TypeScript dans le dossier components/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}