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
    // Using orElse - arrow function can return TaskEither
    {
      code: `
        import { pipe, te } from "ti-fptsu/lib"

        let notifyObserver = (id) =>
          pipe(
            observerClient.notifyConfigUpdate("add", id),
            te.map(() => id),
            te.orElse(() => te.of(id)),
          )
      `,
    },
    // Using fold - arrow functions can return Task/TaskEither
    {
      code: `
        import { pipe, te } from "ti-fptsu/lib"

        let handleResult = (result) =>
          pipe(
            result,
            te.fold(
              () => te.of("error"),
              () => te.of("success"),
            ),
          )
      `,
    },
    // Using getOrElse - arrow function can return Task
    {
      code: `
        import { pipe, te } from "ti-fptsu/lib"

        let getValueOrDefault = (result) =>
          pipe(
            result,
            te.getOrElse(() => te.of("default")),
          )
      `,
    },
    // Using orElseW - arrow function can return TaskEither with different error type
    {
      code: `
        import { pipe, te } from "ti-fptsu/lib"

        let handleError = (result) =>
          pipe(
            result,
            te.orElseW(() => te.left("different error")),
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
    // Multiple valid patterns with TaskEither
    {
      code: `
        import { pipe, te } from "ti-fptsu/lib"

        let process = pipe(
          te.of(1),
          te.flatMap(x => te.of(x + 1)),
          te.orElse(() => te.of(0)),
          te.fold(
            () => te.of("error"),
            x => te.of(x.toString()),
          ),
        )
      `,
    },
  ],

  invalid: [
    // Should flag Task returned without flatMap - direct pipe argument
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
    // Should flag simple case - pipe(t.of(1), () => t.of(2))
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
    // Should flag multiple direct Task returns - pipe(t.of(1), () => t.of(2), () => t.of(3))
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as t from "fp-ts/Task"

        const process = pipe(
          t.of(1),
          () => t.of(2),
          () => t.of(3),
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
    // Should flag TaskEither returned without flatMap
    {
      code: `
        import { pipe, te } from "ti-fptsu/lib"

        const process = pipe(
          te.of(1),
          () => te.of(2),
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
