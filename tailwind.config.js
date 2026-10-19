/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FBF9F5',
          warm: '#F3EFE6',
          pure: '#FFFFFF',
          border: '#E5E0D5',
        },
        weser: {
          navy: '#083476',
          dark: '#0B192C',
          blue: '#0490F3',
          light: '#EBF5FF',
        },
        aue: {
          green: '#26890D',
          dark: '#1D6B0A',
          light: '#EEF8EB',
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
