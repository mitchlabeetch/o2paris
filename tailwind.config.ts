import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        water: {
          light: '#F0F8FF', // AliceBlue - keeping the better palette from current branch
          main: '#00A8E8', // Same as DEFAULT, needed for semantic naming in @apply and components
          DEFAULT: '#00A8E8', // Cyan-blue
          dark: '#007EA7', // Ocean blue
          deep: '#003459', // Navy
        },
      },
    },
  },
  plugins: [],
};
export default config;
