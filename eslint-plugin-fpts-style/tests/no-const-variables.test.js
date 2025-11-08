const { RuleTester } = require("eslint")
const rule = require("../rules/no-const-variables")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-const-variables", rule, {
  valid: [
    // Using let is correct
    {
      code: `
        let x = 42
        let result = x * 2
      `,
    },
    // Top-level UPPER_CASE const is allowed
    {
      code: `
        const API_URL = "https://api.example.com"
        const MAX_RETRIES = 3
      `,
    },
    // Module-level UPPER_CASE const
    {
      code: `
        const DEFAULT_CONFIG = { timeout: 5000 }
      `,
    },
  ],

  invalid: [
    // Should flag const for regular variables when fp-ts is imported
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const x = 42
        const result = x * 2
      `,
      output: `
        import * as te from "fp-ts/TaskEither"

        let x = 42
        let result = x * 2
      `,
      errors: [
        {
          messageId: "preferLet",
        },
        {
          messageId: "preferLet",
        },
      ],
    },
    // Should flag const in functions
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        function getData() {
          const result = fetch("/api")
          return result
        }
      `,
      output: `
        import * as te from "fp-ts/TaskEither"

        function getData() {
          let result = fetch("/api")
          return result
        }
      `,
      errors: [
        {
          messageId: "preferLet",
        },
      ],
    },
    // Should flag const arrow functions
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const getData = () => {
          const url = "/api"
          return fetch(url)
        }
      `,
      output: `
        import * as te from "fp-ts/TaskEither"

        let getData = () => {
          let url = "/api"
          return fetch(url)
        }
      `,
      errors: [
        {
          messageId: "preferLet",
        },
        {
          messageId: "preferLet",
        },
      ],
    },
  ],
})

console.log("All no-const-variables tests passed!")
