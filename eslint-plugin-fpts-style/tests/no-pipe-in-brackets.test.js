const { RuleTester } = require("eslint")
const rule = require("../rules/no-pipe-in-brackets")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-pipe-in-brackets", rule, {
  valid: [
    // Single pipe expression without brackets
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
    // Curried function returning pipe without brackets
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
    // Triple curried function returning pipe without brackets
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const createSubscription = (subDb) => (axiom) => (userId) => pipe(
          te.of(userId),
          te.map(x => ({ id: x }))
        )
      `,
    },
    // Using flow instead of pipe
    {
      code: `
        import { flow } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const process = (id) => flow(
          te.of,
          te.map(x => x * 2)
        )(id)
      `,
    },
    // No fp-ts import, brackets are fine
    {
      code: `
        const getData = (id) => {
          const data = { id }
          return data
        }
      `,
    },
    // Returning something other than pipe/flow in brackets is fine
    {
      code: `
        import { pipe } from "fp-ts/function"

        const getData = (id) => {
          const data = { id }
          return data
        }
      `,
    },
  ],

  invalid: [
    // Should flag pipe return inside brackets
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const getData = (id) => {
          return pipe(
            te.of(id),
            te.map(x => x * 2)
          )
        }
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag pipe return with variable declarations
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const createSubscription = (subDb, axiom, userId) => (stripeSubscription) => {
          let tier = stripeSubscription.status === "active" ? "pro" : "free"
          let status = stripeSubscription.status

          let subscriptionData = {
            user_id: userId,
            stripe_customer_id: stripeSubscription.customer,
            tier,
            status,
          }

          return pipe(
            te.of(subscriptionData),
            te.tapIO(() => console.log("Done"))
          )
        }
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag flow return inside brackets
    {
      code: `
        import { flow } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const process = (id) => {
          return flow(
            te.of,
            te.map(x => x * 2)
          )(id)
        }
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag nested curried functions with brackets
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const outer = (a) => (b) => {
          const data = { a, b }
          return pipe(
            te.of(data),
            te.map(x => x)
          )
        }
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag with ti-fptsu import
    {
      code: `
        import { pipe } from "ti-fptsu/lib"
        import * as te from "fp-ts/TaskEither"

        const getData = (id) => {
          return pipe(
            te.of(id),
            te.map(x => x * 2)
          )
        }
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
  ],
})

console.log("All no-pipe-in-brackets tests passed!")
