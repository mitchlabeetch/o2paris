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
          light: '#E3F2FD',
          DEFAULT: '#2196F3',
          dark: '#1565C0',
          deep: '#0D47A1',
        },
      },
    },
  },
  plugins: [],
};
export default config;
