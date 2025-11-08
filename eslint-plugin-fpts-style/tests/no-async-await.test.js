const { RuleTester } = require("eslint")
const rule = require("../rules/no-async-await")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-async-await", rule, {
  valid: [
    // Using TaskEither instead of async/await
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const fetchData = (url) => te.tryCatch(
          () => fetch(url),
          (error) => new Error(String(error))
        )
      `,
    },
    // No fp-ts import - allowed
    {
      code: `
        async function getData() {
          return await fetch("/api/data")
        }
      `,
    },
  ],

  invalid: [
    // Should flag async function when fp-ts is imported
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        async function getData() {
          return await fetch("/api/data")
        }
      `,
      errors: [
        {
          messageId: "noAsync",
        },
        {
          messageId: "noAwaitInFunction",
        },
      ],
    },
    // Should flag await expression
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        async function getData() {
          const result = await fetch("/api/data")
          return result
        }
      `,
      errors: [
        {
          messageId: "noAsync",
        },
        {
          messageId: "noAwaitInFunction",
        },
      ],
    },
    // Should flag async arrow function
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const getData = async () => {
          return await fetch("/api/data")
        }
      `,
      errors: [
        {
          messageId: "noAsync",
        },
        {
          messageId: "noAwaitInFunction",
        },
      ],
    },
  ],
})

console.log("All no-async-await tests passed!")
