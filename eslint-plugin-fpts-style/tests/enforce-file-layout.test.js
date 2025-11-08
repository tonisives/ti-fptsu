const { RuleTester } = require("eslint")
const rule = require("../rules/enforce-file-layout")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("enforce-file-layout", rule, {
  valid: [
    {
      code: `
        export const foo = 1
        export function bar() {}

        const privateHelper = () => {}
        function privateFunction() {}
      `,
    },
    {
      code: `
        export const createUser = (name) => ({ name })

        const validateName = (name) => name.length > 0
      `,
    },
    {
      code: `
        export function publicApi() {}
        export const CONSTANT = 42

        const helper1 = () => {}
        const helper2 = () => {}
      `,
    },
    {
      code: `
        const privateOnly = () => {}
        function anotherPrivate() {}
      `,
    },
    {
      code: `
        export const onlyExports = 1
        export function alsoExported() {}
      `,
    },
  ],

  invalid: [
    {
      code: `
        const privateHelper = () => {}

        export const foo = 1
      `,
      errors: [
        {
          messageId: "exportAfterPrivate",
          data: { type: "const", name: "foo" },
        },
      ],
    },
    {
      code: `
        export const first = 1

        const privateHelper = () => {}

        export function second() {}
      `,
      errors: [
        {
          messageId: "exportAfterPrivate",
          data: { type: "function", name: "second" },
        },
      ],
    },
    {
      code: `
        function privateFunction() {}

        export const API = {}
        export function publicFunction() {}
      `,
      errors: [
        {
          messageId: "exportAfterPrivate",
          data: { type: "const", name: "API" },
        },
        {
          messageId: "exportAfterPrivate",
          data: { type: "function", name: "publicFunction" },
        },
      ],
    },
  ],
})

console.log("All tests passed!")
