// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.neutral,
      accent: colors.amber,
      error: colors.red,
      transparent: "transparent",
    },
    extend: {
      fontFamily: {
        sans: `"Pathway Extreme", sans-serif`,
      },
      borderColor: {
        current: "currentColor",
      },
    },
  },
  plugins: [],
  corePlugins: {
    container: false,
  },
}
