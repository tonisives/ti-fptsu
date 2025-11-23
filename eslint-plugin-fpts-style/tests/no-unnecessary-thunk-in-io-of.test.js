const { RuleTester } = require("eslint")
const rule = require("../rules/no-unnecessary-thunk-in-io-of")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-unnecessary-thunk-in-io-of", rule, {
  valid: [
    // Correct usage: io.of with direct value
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(42)
      `,
    },
    // Correct usage: io.of with expression
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(x + 1)
      `,
    },
    // Correct usage: io.of with function call
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(someFunction())
      `,
    },
    // Correct usage: arrow function with parameters
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of((x) => x + 1)
      `,
    },
    // No fp-ts import - allowed
    {
      code: `
        let getValue = io.of(() => 42)
      `,
    },
    // Direct arrow function (not wrapped in io.of)
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = () => {
          console.log("test")
          return 42
        }
      `,
    },
  ],

  invalid: [
    // Should simplify: io.of(() => value)
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(() => 42)
      `,
      errors: [
        {
          messageId: "unnecessaryThunk",
        },
      ],
      output: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(42)
      `,
    },
    // Should simplify: io.of(() => expression)
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(() => x + 1)
      `,
      errors: [
        {
          messageId: "unnecessaryThunk",
        },
      ],
      output: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(x + 1)
      `,
    },
    // Should simplify: io.of(() => functionCall())
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(() => someFunction())
      `,
      errors: [
        {
          messageId: "unnecessaryThunk",
        },
      ],
      output: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(someFunction())
      `,
    },
    // Multi-line case - should warn
    {
      code: `
        import { io } from "ti-fptsu/lib"

        let getValue = io.of(() => {
          console.log("test")
          return 42
        })
      `,
      errors: [
        {
          messageId: "multiLineThunk",
        },
      ],
    },
    // With fp-ts import
    {
      code: `
        import * as IO from "fp-ts/IO"

        let getValue = io.of(() => 42)
      `,
      errors: [
        {
          messageId: "unnecessaryThunk",
        },
      ],
      output: `
        import * as IO from "fp-ts/IO"

        let getValue = io.of(42)
      `,
    },
  ],
})

console.log("All no-unnecessary-thunk-in-io-of tests passed!")
