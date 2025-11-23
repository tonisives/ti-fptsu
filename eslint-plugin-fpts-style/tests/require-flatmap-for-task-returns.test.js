const { RuleTester } = require("eslint")
const rule = require("../rules/require-flatmap-for-task-returns")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("require-flatmap-for-task-returns", rule, {
  valid: [
    // Using flatMap is correct
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as t from "fp-ts/Task"

        let cleanupOnError = (result) =>
          pipe(
            result.db ? releaseJobLockAfterError(result.db) : t.of(undefined),
            t.flatMap(() => t.of(undefined)),
            t.flatMap(() => result.db ? closeDbOnError(result.db) : t.of(undefined)),
          )
      `,
    },
    // Using chain is also correct
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as t from "fp-ts/Task"

        let cleanupOnError = (result) =>
          pipe(
            result.db ? releaseJobLockAfterError(result.db) : t.of(undefined),
            t.chain(() => t.of(undefined)),
          )
      `,
    },
    // Not in a pipe - don't check
    {
      code: `
        import * as t from "fp-ts/Task"

        let cleanupOnError = (result) => t.of(undefined)
      `,
    },
  ],

  invalid: [
    // Should flag Task returned without flatMap
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as t from "fp-ts/Task"

        let cleanupOnError = (result) =>
          pipe(
            result.db ? releaseJobLockAfterError(result.db) : t.of(undefined),
            () => t.of(undefined),
            () => (result.db ? closeDbOnError(result.db) : t.of(undefined)),
          )
      `,
      errors: [
        {
          message:
            "Task returned from function must be flatMap-d, not just returned. Use flatMap/chain to properly sequence the Task.",
        },
        {
          message:
            "Task returned from function must be flatMap-d, not just returned. Use flatMap/chain to properly sequence the Task.",
        },
      ],
    },
    // Should flag simple case
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as t from "fp-ts/Task"

        const process = pipe(
          t.of(1),
          () => t.of(2),
        )
      `,
      errors: [
        {
          message:
            "Task returned from function must be flatMap-d, not just returned. Use flatMap/chain to properly sequence the Task.",
        },
      ],
    },
    // Should flag function call that returns Task
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as t from "fp-ts/Task"

        const process = pipe(
          t.of(1),
          () => someTaskFunction(),
        )
      `,
      errors: [
        {
          message:
            "Task returned from function must be flatMap-d, not just returned. Use flatMap/chain to properly sequence the Task.",
        },
      ],
    },
  ],
})

console.log("All require-flatmap-for-task-returns tests passed!")
