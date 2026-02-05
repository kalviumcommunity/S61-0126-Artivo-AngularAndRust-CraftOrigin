/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        accent: '#8b5cf6',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      },
    },
  },
  plugins: [],
  safelist: [
    // Ensure all color classes are generated
    {
      pattern: /^(bg|text|border|ring|divide)-(emerald|sky|amber|orange|blue|indigo|purple|green|pink|red|yellow|gray)-\d{1,3}$/,
    },
    {
      pattern: /^(from|to|via)-(emerald|sky|amber|orange|blue|indigo|purple|green|pink|red|yellow|gray)-\d{1,3}$/,
    },
    {
      pattern: /^(hover|focus):(bg|text|border|shadow|scale|translate)-(.*?)$/,
    },
  ],
}
