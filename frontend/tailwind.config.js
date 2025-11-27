/** @type {import('tailwindcss').Config} */
const config = {
  content: [
<<<<<<< HEAD
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
=======
    // Look inside the top-level 'app' folder (which contains [locale])
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Look inside a top-level 'components' folder (if it exists)
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Keep the 'src' path if you still have files inside a 'src' folder
    "./src/**/*.{js,ts,jsx,tsx,mdx}", 
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        jost: ['Jost', 'sans-serif'],
      },
      keyframes: {
        fadeInFloat: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fadeInFloat: 'fadeInFloat 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;