const { RuleTester } = require("eslint")
const rule = require("../rules/simplify-task-constructors")

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

ruleTester.run("simplify-task-constructors", rule, {
  valid: [
    // Already using t.of
    {
      code: `
        import { t } from "ti-fptsu/lib"
        import * as l from "./logger"

        let handleDbCloseSuccess = () => t.of(l.info("Database connection closed"))
      `,
    },
    // Already using t.fromIO
    {
      code: `
        import { t } from "ti-fptsu/lib"
        import * as l from "./logger"

        let handleDbCloseError = (error) =>
          t.fromIO(() => {
            l.error(\`Failed to close database connection: \${error}\`)
            if (globalAxiom) {
              globalAxiom.error(error, {
                context: "db_close_failure",
              })
            }
          })
      `,
    },
    // No fp-ts import - allowed
    {
      code: `
        let handleDbCloseSuccess = () => () =>
          Promise.resolve(console.log("Database connection closed"))
      `,
    },
  ],

  invalid: [
    // Should suggest t.of for simple Promise.resolve
    {
      code: `
        import { t } from "ti-fptsu/lib"
        import * as l from "./logger"

        let handleDbCloseSuccess = () => () =>
          Promise.resolve(l.info("Database connection closed"))
      `,
      errors: [
        {
          messageId: "useTaskOf",
        },
      ],
      output: `
        import { t } from "ti-fptsu/lib"
        import * as l from "./logger"

        let handleDbCloseSuccess = () => t.of(l.info("Database connection closed"))
      `,
    },
    // Should suggest t.fromIO for Promise.resolve().then()
    {
      code: `
        import { t } from "ti-fptsu/lib"
        import * as l from "./logger"

        let handleDbCloseError = (error) => () =>
          Promise.resolve().then(() => {
            l.error(\`Failed to close database connection: \${error}\`)
            if (globalAxiom) {
              globalAxiom.error(error, {
                context: "db_close_failure",
              })
            }
          })
      `,
      errors: [
        {
          messageId: "useTaskFromIO",
        },
      ],
      output: `
        import { t } from "ti-fptsu/lib"
        import * as l from "./logger"

        let handleDbCloseError = (error) => t.fromIO(() => {
            l.error(\`Failed to close database connection: \${error}\`)
            if (globalAxiom) {
              globalAxiom.error(error, {
                context: "db_close_failure",
              })
            }
          })
      `,
    },
    // With fp-ts import
    {
      code: `
        import * as Task from "fp-ts/Task"

        let doSomething = () => () => Promise.resolve(42)
      `,
      errors: [
        {
          messageId: "useTaskOf",
        },
      ],
      output: `
        import * as Task from "fp-ts/Task"

        let doSomething = () => t.of(42)
      `,
    },
  ],
})

console.log("All simplify-task-constructors tests passed!")
