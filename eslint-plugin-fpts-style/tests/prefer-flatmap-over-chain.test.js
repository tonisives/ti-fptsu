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
          message: "Use 'flatMap' instead of deprecated 'chain'.",
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
          message: "Use 'flatMap' instead of deprecated 'chainW'.",
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
          message: "Use 'flatMap' instead of deprecated 'chain'.",
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
          message: "Use 'flatMap' instead of deprecated 'chain'.",
        },
      ],
      output: `
        import * as o from "fp-ts/Option"

        const bad = o.flatMap((x) => o.some(x * 2))
      `,
    },
    // Should flag chainIOK function call
    {
      code: `
        import { chainIOK } from "fp-ts/TaskEither"

        const bad = chainIOK((x) => () => x * 2)
      `,
      errors: [
        {
          message: "Use 'flatMapIO' instead of deprecated 'chainIOK'.",
        },
      ],
      output: `
        import { chainIOK } from "fp-ts/TaskEither"

        const bad = flatMapIO((x) => () => x * 2)
      `,
    },
    // Should flag chainFirstIOK function call
    {
      code: `
        import { chainFirstIOK } from "fp-ts/TaskEither"

        const bad = chainFirstIOK((x) => () => console.log(x))
      `,
      errors: [
        {
          message: "Use 'tapIO' instead of deprecated 'chainFirstIOK'.",
        },
      ],
      output: `
        import { chainFirstIOK } from "fp-ts/TaskEither"

        const bad = tapIO((x) => () => console.log(x))
      `,
    },
    // Should flag chainTaskK function call
    {
      code: `
        import { chainTaskK } from "fp-ts/TaskEither"

        const bad = chainTaskK((x) => async () => x * 2)
      `,
      errors: [
        {
          message: "Use 'flatMapTask' instead of deprecated 'chainTaskK'.",
        },
      ],
      output: `
        import { chainTaskK } from "fp-ts/TaskEither"

        const bad = flatMapTask((x) => async () => x * 2)
      `,
    },
    // Should flag te.chainIOK method call
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.chainIOK((x) => () => x * 2)
      `,
      errors: [
        {
          message: "Use 'flatMapIO' instead of deprecated 'chainIOK'.",
        },
      ],
      output: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.flatMapIO((x) => () => x * 2)
      `,
    },
    // Should flag te.chainFirstIOK method call
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.chainFirstIOK((x) => () => console.log(x))
      `,
      errors: [
        {
          message: "Use 'tapIO' instead of deprecated 'chainFirstIOK'.",
        },
      ],
      output: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.tapIO((x) => () => console.log(x))
      `,
    },
    // Should flag te.chainFirst method call
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.chainFirst((x) => te.of(x * 2))
      `,
      errors: [
        {
          message: "Use 'tap' instead of deprecated 'chainFirst'.",
        },
      ],
      output: `
        import * as te from "fp-ts/TaskEither"

        const bad = te.tap((x) => te.of(x * 2))
      `,
    },
  ],
})

console.log("All prefer-flatmap-over-chain tests passed!")
