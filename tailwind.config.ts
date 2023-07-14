// eslint-disable-next-line @typescript-eslint/no-var-requires
import { type Config } from "tailwindcss"
import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"

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
        ...(utils.theme("width") as Record<string, string>),
      }),
      maxWidth: (utils) => ({
        ...(utils.theme("width") as Record<string, string>),
      }),
    },
  },
  plugins: [
    plugin(function sizePlugin(api) {
      api.matchUtilities(
        { s: (value: string) => ({ width: value, height: value }) },
        { values: api.theme("width") },
      )
    }),
  ],
  corePlugins: {
    container: false,
  },
} satisfies Config
