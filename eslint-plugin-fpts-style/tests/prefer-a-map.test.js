const { RuleTester } = require("eslint")
const rule = require("../rules/prefer-a-map")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("prefer-a-map", rule, {
  valid: [
    // Using a.map is correct
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"
        import * as a from "fp-ts/Array"

        const good = pipe(
          te.of([1, 2, 3]),
          te.map(a.map((x) => x * 2))
        )
      `,
    },
    // fp-ts module methods like te.map should not be flagged
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const good = pipe(
          te.of(42),
          te.map((x) => x * 2)
        )
      `,
    },
    // e.map should not be flagged
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as e from "fp-ts/Either"

        const good = pipe(
          e.right(42),
          e.map((x) => x * 2)
        )
      `,
    },
    // o.map should not be flagged
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as o from "fp-ts/Option"

        const good = pipe(
          o.some(42),
          o.map((x) => x * 2)
        )
      `,
    },
    // No fp-ts import - should not check
    {
      code: `
        const arr = [1, 2, 3]
        const result = arr.map(x => x * 2)
      `,
    },
    // Outside of fp-ts context - should not flag
    {
      code: `
        import * as te from "fp-ts/TaskEither"

        const arr = [1, 2, 3]
        const result = arr.map(x => x * 2)
      `,
    },
    // Map on call expression result
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"
        import * as a from "fp-ts/Array"

        const good = pipe(
          te.of([1, 2, 3]),
          te.map(a.map((x) => x * 2).map(y => y + 1))
        )
      `,
    },
  ],

  invalid: [
    // Should flag array.map inside te.map
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const bad = pipe(
          te.of([1, 2, 3]),
          te.map((arr) => arr.map((x) => x * 2))
        )
      `,
      errors: [
        {
          message:
            "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
        },
      ],
    },
    // Should flag array.map inside pipe
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const arr = [1, 2, 3]
        const bad = pipe(
          arr,
          (xs) => xs.map(x => x * 2)
        )
      `,
      errors: [
        {
          message:
            "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
        },
      ],
    },
    // Should flag nested array.map
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const bad = pipe(
          te.of([[1, 2], [3, 4]]),
          te.map((matrix) => matrix.map(row => row.map(x => x * 2)))
        )
      `,
      errors: [
        {
          message:
            "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
        },
        {
          message:
            "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
        },
      ],
    },
    // Should flag in rte.map context
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as rte from "fp-ts/ReaderTaskEither"

        const bad = pipe(
          rte.of([1, 2, 3]),
          rte.map((arr) => arr.map((x) => x * 2))
        )
      `,
      errors: [
        {
          message:
            "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
        },
      ],
    },
    // Should flag in e.map context
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as e from "fp-ts/Either"

        const bad = pipe(
          e.right([1, 2, 3]),
          e.map((arr) => arr.map((x) => x * 2))
        )
      `,
      errors: [
        {
          message:
            "Use 'a.map' instead of '.map()' method call. Import 'a' from 'fp-ts/Array' or 'ti-fptsu/lib'.",
        },
      ],
    },
  ],
})

console.log("All prefer-a-map tests passed!")
