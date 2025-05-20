/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cardBackground: '#FFFFFF',
        darkerBackground: '#E9E7E4',
        background: '#E5E7EB',
        buttonPrimary: '#141417',
        buttonBorder: '#E9E7E4',
        success: '#1D8560',
        error: '#CE4343',
        textPrimary: '#141417',
        textSecondary: '#4B5563',
        textLight: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
