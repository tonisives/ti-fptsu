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
    // Small nested pipe with 3 arguments is allowed (default config)
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
    },
    // Small nested pipe with 3 arguments is allowed (default config)
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const result = pipe(
          te.of(42),
          te.flatMap(x => pipe(
            te.of(x),
            te.map(y => y * 2),
            te.flatMap(z => te.of(z + 1))
          ))
        )
      `,
    },
    // Nested pipe with 5 arguments is allowed when maxNestedPipeArgs is 5
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const result = pipe(
          te.of(42),
          te.map(x => pipe(
            te.of(x),
            te.map(y => y * 2),
            te.flatMap(z => te.of(z + 1)),
            te.map(w => w * 3),
            te.flatMap(v => te.of(v + 5))
          ))
        )
      `,
      options: [{ maxNestedPipeArgs: 5 }],
    },
  ],

  invalid: [
    // Should flag nested pipes with more than 3 arguments (default)
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const result = pipe(
          te.of(42),
          te.map(x => pipe(
            te.of(x),
            te.map(y => y * 2),
            te.flatMap(z => te.of(z + 1)),
            te.map(w => w * 3)
          ))
        )
      `,
      errors: [
        {
          messageId: "nestedPipe",
        },
      ],
    },
    // Should flag all nested pipes when maxNestedPipeArgs is 0
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
      options: [{ maxNestedPipeArgs: 0 }],
      errors: [
        {
          messageId: "nestedPipe",
        },
      ],
    },
    // Should flag nested pipes with more than 1 argument when maxNestedPipeArgs is 1
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
      options: [{ maxNestedPipeArgs: 1 }],
      errors: [
        {
          messageId: "nestedPipe",
        },
      ],
    },
  ],
})

console.log("All no-nested-pipes tests passed!")
