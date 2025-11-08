const { RuleTester } = require("eslint")
const rule = require("../rules/prefer-flatmap-over-chain")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("prefer-flatmap-over-chain", rule, {
  valid: [
    // Using flatMap is correct
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const good = te.flatMap((x) => te.of(x * 2))
      `,
    },
    // No fp-ts import
    {
      code: `
        const chain = { chain: (f) => f() }
        chain.chain(() => {})
      `,
    },
  ],

  invalid: [
    // Should flag te.chain
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.chain((x) => te.of(x * 2))
      `,
      errors: [
        {
          message: "Use 'flatMap' instead of deprecated 'chain' method.",
        },
      ],
      output: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.flatMap((x) => te.of(x * 2))
      `,
    },
    // Should flag te.chainW
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.chainW((x) => te.of(x * 2))
      `,
      errors: [
        {
          message: "Use 'flatMap' instead of deprecated 'chainW' method.",
        },
      ],
      output: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.flatMap((x) => te.of(x * 2))
      `,
    },
    // Should flag e.chain
    {
      code: `
        import * as e from "fp-ts/Either"

        const bad = e.chain((x) => e.right(x * 2))
      `,
      errors: [
        {
          message: "Use 'flatMap' instead of deprecated 'chain' method.",
        },
      ],
      output: `
        import * as e from "fp-ts/Either"

        const bad = e.flatMap((x) => e.right(x * 2))
      `,
    },
    // Should flag o.chain
    {
      code: `
        import * as o from "fp-ts/Option"

        const bad = o.chain((x) => o.some(x * 2))
      `,
      errors: [
        {
          message: "Use 'flatMap' instead of deprecated 'chain' method.",
        },
      ],
      output: `
        import * as o from "fp-ts/Option"

        const bad = o.flatMap((x) => o.some(x * 2))
      `,
    },
  ],
})

console.log("All prefer-flatmap-over-chain tests passed!")
