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
      ...fptsStyle.configs.recommended.rules,
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
]
