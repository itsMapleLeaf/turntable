/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [require.resolve("@itsmapleleaf/configs/eslint")],
  ignorePatterns: [
    "**/node_modules/**",
    "**/build/**",
    "**/dist/**",
    "**/.cache/**",
    "**/public/**",
  ],
  parserOptions: {
    project: require.resolve("./tsconfig.json"),
  },
  rules: {
    "unicorn/filename-case": "off",
    "unicorn/text-encoding-identifier-case": "off",
    "jsx-a11y/media-has-caption": "off",
    "react/no-unescaped-entities": "off",
  },
}
