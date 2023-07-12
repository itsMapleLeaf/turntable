// eslint-disable-next-line @typescript-eslint/no-var-requires
import { type Config } from "tailwindcss"
import colors from "tailwindcss/colors"

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.neutral,
      accent: colors.amber,
      error: colors.red,
      transparent: colors.transparent,
    },
    extend: {
      fontFamily: {
        sans: `"Pathway Extreme", sans-serif`,
      },
      borderColor: {
        current: colors.current,
      },
      minWidth: (utils) => ({
        ...(utils.theme("width") as object),
      }),
      maxWidth: (utils) => ({
        ...(utils.theme("width") as object),
      }),
    },
  },
  plugins: [],
  corePlugins: {
    container: false,
  },
} satisfies Config
