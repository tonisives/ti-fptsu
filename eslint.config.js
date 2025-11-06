const tsParser = require("@typescript-eslint/parser")
const fptsStyle = require("./eslint-plugin-fpts-style")

module.exports = [
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      "fpts-style": fptsStyle,
    },
    rules: {
      "fpts-style/no-statements-outside-pipe": "error",
      "fpts-style/prefer-flatmap-over-chain": "error",
      "fpts-style/no-nested-pipes": "error",
      "fpts-style/no-const-variables": "warn",
      "fpts-style/no-async-await": "error",
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
]
