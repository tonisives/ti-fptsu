const { RuleTester } = require("eslint")
const rule = require("../rules/no-long-inline-functions-in-pipe")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-long-inline-functions-in-pipe", rule, {
  valid: [
    {
      code: `
        import { pipe } from 'fp-ts/function'
        import * as te from 'fp-ts/TaskEither'

        const shortFunction = (x) => x + 1

        pipe(
          getData(),
          te.map(shortFunction)
        )
      `,
    },
    {
      code: `
        import { pipe } from 'fp-ts/function'
        import * as te from 'fp-ts/TaskEither'

        pipe(
          getData(),
          te.map((x) => {
            return x + 1
          })
        )
      `,
    },
    {
      code: `
        import { pipe } from 'fp-ts/function'
        import * as te from 'fp-ts/TaskEither'

        pipe(
          getData(),
          te.map((x) => {
            const y = x + 1
            return y
          })
        )
      `,
    },
    {
      code: `
        import { pipe } from 'ti-fptsu/lib'
        import * as te from 'fp-ts/TaskEither'

        pipe(
          getData(),
          te.map((x) => x + 1),
          te.map((y) => y * 2)
        )
      `,
    },
  ],

  invalid: [
    {
      code: `
        import { pipe } from 'fp-ts/function'
        import * as te from 'fp-ts/TaskEither'

        pipe(
          getData(),
          te.map((x) => {
            const y = x + 1
            const z = y * 2
            const w = z - 3
            const v = w / 4
            return v
          })
        )
      `,
      errors: [
        {
          messageId: "longInlineFunction",
          data: { lines: "7", maxLines: "5" },
        },
      ],
    },
    {
      code: `
        import { pipe } from 'fp-ts/function'
        import * as te from 'fp-ts/TaskEither'

        pipe(
          getData(),
          te.match(
            (error) => {
              if (error.error === "NOT_FOUND") {
                const response = createErrorResponse("NOT_FOUND", "No active subscription found")
                return reply.status(404).send(response)
              }
              const response = createErrorResponse(error.error, error.message || "Failed")
              return reply.status(500).send(response)
            },
            (data) => data
          )
        )
      `,
      errors: [
        {
          messageId: "longInlineFunction",
          data: { lines: "8", maxLines: "5" },
        },
      ],
    },
    {
      code: `
        import { pipe } from 'ti-fptsu/lib'
        import * as te from 'fp-ts/TaskEither'

        pipe(
          (x) => {
            const a = x + 1
            const b = a * 2
            const c = b - 3
            const d = c / 4
            const e = d + 5
            return e
          }
        )
      `,
      errors: [
        {
          messageId: "longInlineFunction",
          data: { lines: "8", maxLines: "5" },
        },
      ],
    },
  ],
})

console.log("All tests passed!")
