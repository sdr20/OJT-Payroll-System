module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  theme: {
    extend: {
      colors: {
        'blue-600': '#2563EB',
        'indigo-100': '#E0E7FF',
        // Add other custom colors if needed
      },
    },
  },
  plugins: [],
};

