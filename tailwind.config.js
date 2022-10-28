module.exports = {
  content: ['./src/**/*.{ejs,tsx}'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['dracula'],
  },
  plugins: [require('daisyui')],
};
