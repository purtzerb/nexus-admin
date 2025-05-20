/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        darkerBackground: '#E9E7E4',
        background: '#E5E7EB',
        buttonPrimary: '#141417',
        buttonBorder: '#E9E7E4',
        success: '#1D8560',
        error: '#CE4343',
      },
    },
  },
  plugins: [],
};
