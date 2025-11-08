const { RuleTester } = require("eslint")
const rule = require("../rules/no-statements-outside-pipe")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-statements-outside-pipe", rule, {
  valid: [
    // Single pipe expression without block
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const getData = (id) => pipe(
          te.of(id),
          te.map(x => x * 2)
        )
      `,
    },
    // Curried function returning pipe
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const getData = (deps) => (id) => pipe(
          te.of(id),
          te.map(x => x * 2)
        )
      `,
    },
    // No fp-ts import
    {
      code: `
        const getData = (id) => {
          console.log(id)
          return id * 2
        }
      `,
    },
  ],

  invalid: [
    // Should flag statements outside pipe
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const getData = (id) => {
          console.log(id)
          return pipe(
            te.of(id),
            te.map(x => x * 2)
          )
        }
      `,
      errors: [
        {
          messageId: "multipleStatements",
        },
        {
          messageId: "statementOutsidePipe",
        },
      ],
    },
    // Should flag multiple statements
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const getData = (id) => {
          doSomething()
          doSomethingElse()
          return pipe(
            te.of(id),
            te.map(x => x * 2)
          )
        }
      `,
      errors: [
        {
          messageId: "multipleStatements",
        },
        {
          messageId: "statementOutsidePipe",
        },
        {
          messageId: "statementOutsidePipe",
        },
      ],
    },
  ],
})

console.log("All no-statements-outside-pipe tests passed!")
