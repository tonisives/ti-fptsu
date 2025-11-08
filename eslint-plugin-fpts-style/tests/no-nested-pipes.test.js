const { RuleTester } = require("eslint")
const rule = require("../rules/no-nested-pipes")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-nested-pipes", rule, {
  valid: [
    // Single pipe is fine
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const result = pipe(
          te.of(42),
          te.map(x => x * 2)
        )
      `,
    },
    // Pipe not nested
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const result1 = pipe(te.of(1), te.map(x => x * 2))
        const result2 = pipe(te.of(2), te.map(x => x * 3))
      `,
    },
  ],

  invalid: [
    // Should flag nested pipes
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const result = pipe(
          te.of(42),
          te.map(x => pipe(
            te.of(x),
            te.map(y => y * 2)
          ))
        )
      `,
      errors: [
        {
          messageId: "nestedPipe",
        },
      ],
    },
  ],
})

console.log("All no-nested-pipes tests passed!")
