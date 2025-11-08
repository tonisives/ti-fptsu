const { RuleTester } = require("eslint")
const rule = require("../rules/no-fp-ts-lib-imports")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("no-fp-ts-lib-imports", rule, {
  valid: [
    {
      code: 'import { pipe, e, te } from "ti-fptsu/lib"',
    },
    {
      code: 'import { pipe } from "ti-fptsu/lib"',
    },
    {
      code: 'import * as fpts from "ti-fptsu/lib"',
    },
    {
      code: 'import { Either } from "fp-ts/Either"',
    },
    {
      code: 'import * as E from "fp-ts/Either"',
    },
  ],
  invalid: [
    {
      code: 'import * as E from "fp-ts/lib/Either.js"',
      errors: [{ messageId: "noFpTsLibImport" }],
    },
    {
      code: 'import { either } from "fp-ts/lib/Either.js"',
      errors: [{ messageId: "noFpTsLibImport" }],
    },
    {
      code: 'import * as TE from "fp-ts/lib/TaskEither.js"',
      errors: [{ messageId: "noFpTsLibImport" }],
    },
    {
      code: 'import { pipe } from "fp-ts/lib/function.js"',
      errors: [{ messageId: "noFpTsLibImport" }],
    },
  ],
})

console.log("All tests passed for no-fp-ts-lib-imports!")
