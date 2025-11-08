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
    // Ternary without pipe/flow is fine
    {
      code: `
        import { pipe } from "fp-ts/function"

        const getData = (token) =>
          token
            ? fetchData(token)
            : Promise.resolve(null)
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
    // Should flag Fastify route handler pattern
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        fastify.get("/api/users/profile", (request, reply) => {
          let authHeader = request.headers.authorization

          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ error: "Authorization token required" })
          }

          let token = authHeader.substring(7)

          return pipe(
            verifyAccessToken(token),
            te.flatMap((decoded) => getUserById(deps.db)(decoded.userId)),
            te.flatMap(validateUser),
            te.flatMap(fetchProfileWithSubscription(deps.subscriptionDb)),
            te.map((profile) => reply.send(profile)),
            te.mapLeft(logProfileError(reply)),
          )()
        })
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag ternary with pipe in consequent
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        fastify.post("/api/auth/refresh", (request, reply) =>
          request.cookies.refreshToken
            ? pipe(
                verifyRefreshToken(request.cookies.refreshToken),
                te.flatMap(() => getUserSessionByToken(deps.db)(request.cookies.refreshToken)),
                te.map(sendRefreshResponse(reply)),
              )()
            : reply.status(401).send({ error: "Refresh token not found" })
        )
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag ternary with pipe in alternate
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const process = (hasToken) =>
          hasToken
            ? te.of({ success: true })
            : pipe(
                te.of({ success: false }),
                te.flatMap(logError)
              )()
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag nested ternary with pipe
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        const handler = (a, b) =>
          a
            ? b
              ? pipe(te.of(1), te.map(x => x + 1))()
              : te.of(2)
            : te.of(3)
      `,
      errors: [
        {
          messageId: "pipeInBrackets",
        },
      ],
    },
    // Should flag return statement with ternary containing pipe
    {
      code: `
        import { pipe } from "fp-ts/function"
        import * as te from "fp-ts/TaskEither"

        fastify.post("/v0/auth/google", (request, reply) => {
          let { access_token } = request.body

          return !access_token
            ? reply.status(400).send({ error: "Access token is required" })
            : pipe(
                fetchGoogleUserInfo(access_token),
                te.flatMap(handleGoogleUserResponse),
                te.map(sendGoogleAuthResponse(reply)),
              )()
        })
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
