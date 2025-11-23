# Fastify API Setup Guide

This guide describes how to set up Fastify APIs with io-ts validation and fp-ts logic.

## Dependencies

Packages:
- `fastify` - Web framework
- `io-ts` - Runtime type validation
- `ti-fptsu` with `fp-ts` - Functional programming utilities
- `io-ts/lib/PathReporter` - Better error reporting

## Validation Utilities

Create a validation utility file (e.g., `src/util/validate.ts`):

```typescript
import { e, pipe, TaskE, te } from "ti-fptsu/lib"
import * as t from "io-ts"
import { PathReporter } from "io-ts/lib/PathReporter.js"
import { FastifyRequest } from "fastify"

export let validateBody = <T>(request: FastifyRequest, codec: t.Type<T>): TaskE<Error, T> =>
  pipe(request.body, codec.decode, e.mapLeft(joinSchemaErrors), te.fromEither)

export let validateQuery = <T>(request: FastifyRequest, codec: t.Type<T>): TaskE<Error, T> =>
  pipe(request.query, codec.decode, e.mapLeft(joinSchemaErrors), te.fromEither)

export let joinSchemaErrors = (errors: t.Errors): Error => {
  const uniqueErrors = new Set(
    PathReporter.report(e.left(errors)).map((error) => {
      if (error.match(/Invalid value/)) {
        const fieldMatch = error.match(/\/([^/]+):/)
        if (fieldMatch) {
          const fieldName = fieldMatch[1]
          return `${fieldName}`
        }
      }
      return error
    }),
  )

  return new Error("Invalid or missing fields: " + Array.from(uniqueErrors).join(", "))
}
```

## API Endpoint Pattern

### Basic Structure

```typescript
import { FastifyInstance, FastifyRequest } from "fastify"
import { pipe, TaskE, te } from "ti-fptsu/lib"
import * as t from "io-ts"
import { validateBody, validateQuery } from "./util/validate.js"

// Define your io-ts codec for validation
const MyRequestCodec = t.type({
  field1: t.string,
  field2: t.number,
  optionalField: t.union([t.string, t.undefined]),
})

// Register the route
export let registerMyEndpoint = (fastify: FastifyInstance, deps: Deps) =>
  fastify.post("/v0/my-endpoint", (req, res) =>
    pipe(
      handleMyEndpoint(deps, req),
      te.mapBoth(
        (e) => res.status(500).send({ error: e.message }),
        (result) => res.status(200).send(result),
      ),
    )().then(() => void 0),
  )

// Handle the request logic
export let handleMyEndpoint = (deps: Deps, request: FastifyRequest) =>
  pipe(
    validateBody(request, MyRequestCodec), // or validateQuery for GET requests
    te.flatMap((validated) => processRequest(deps, validated)),
    te.map((result) => ({ status: "ok", data: result })),
  )

// Business logic
let processRequest = (deps: Deps, input: t.TypeOf<typeof MyRequestCodec>) =>
  pipe(
    // Your business logic here
    te.of(input),
  )
```

### Query Parameter Validation (GET requests)

```typescript
const QueryCodec = t.type({
  email: t.string,
  limit: t.union([t.string, t.undefined]),
})

export let registerGetEndpoint = (fastify: FastifyInstance, deps: Deps) =>
  fastify.get("/v0/my-endpoint", (req, res) =>
    pipe(
      handleGetEndpoint(deps, req),
      te.mapBoth(
        (e) => res.status(400).send({ error: e.message }),
        (result) => res.status(200).send(result),
      ),
    )().then(() => void 0),
  )

export let handleGetEndpoint = (deps: Deps, request: FastifyRequest) =>
  pipe(
    validateQuery(request, QueryCodec),
    te.flatMap((query) => fetchData(deps, query)),
  )
```

### Body Validation (POST/PUT requests)

```typescript
const BodyCodec = t.type({
  name: t.string,
  age: t.number,
  metadata: t.record(t.string, t.string),
})

export let registerPostEndpoint = (fastify: FastifyInstance, deps: Deps) =>
  fastify.post("/v0/my-endpoint", (req, res) =>
    pipe(
      handlePostEndpoint(deps, req),
      te.mapBoth(
        (e) => res.status(500).send({ error: e.message }),
        () => res.status(200).send({ status: "ok" }),
      ),
    )().then(() => void 0),
  )

export let handlePostEndpoint = (deps: Deps, request: FastifyRequest) =>
  pipe(
    validateBody(request, BodyCodec),
    te.flatMap((body) => createResource(deps, body)),
  )
```

## Error Handling

### Custom Error Status Codes

```typescript
export let registerEndpoint = (fastify: FastifyInstance, deps: Deps) =>
  fastify.post("/v0/endpoint", (req, res) =>
    pipe(
      handleEndpoint(deps, req),
      te.mapBoth(
        (e) => {
          if (e.message.includes("Not found")) {
            return res.status(404).send({ error: e.message })
          }
          if (e.message.includes("Invalid")) {
            return res.status(400).send({ error: e.message })
          }
          return res.status(500).send({ error: e.message })
        },
        (result) => res.status(200).send(result),
      ),
    )().then(() => void 0),
  )
```

### Domain Errors

```typescript
import { toDomainError } from "shared/errors"

let dbOperation = (sql: Sql, data: string) =>
  pipe(
    sql`INSERT INTO table (field) VALUES (${data})`,
    (query) => te.tryCatch(() => query, toDomainError("DB_WRITE_ERROR")),
  )
```

## Common Patterns

### Chaining Operations

```typescript
export let handleComplexEndpoint = (deps: Deps, request: FastifyRequest) =>
  pipe(
    validateBody(request, InputCodec),
    te.tap((input) => validateBusinessRules(deps, input)),
    te.flatMap((input) => fetchRelatedData(deps, input.id)),
    te.flatMap((data) => processData(deps, data)),
    te.flatMap((processed) => saveToDatabase(deps, processed)),
    te.map(() => ({ status: "success" })),
  )
```

### Conditional Logic

```typescript
export let handleConditional = (deps: Deps, request: FastifyRequest) =>
  pipe(
    validateBody(request, InputCodec),
    te.flatMap((input) =>
      input.type === "A"
        ? processTypeA(deps, input)
        : processTypeB(deps, input)
    ),
  )
```

### Multiple Validations

```typescript
export let handleMultiValidation = (deps: Deps, request: FastifyRequest) =>
  pipe(
    validateBody(request, BodyCodec),
    te.tap((body) => validateQuery(request, QueryCodec)),
    te.flatMap((body) => processWithBoth(deps, body, request.query)),
  )
```


## Database Operations with fp-ts

### Basic Query

```typescript
let fetchUser = (sql: Sql, userId: string) =>
  pipe(
    sql`select * from users where id = ${userId}`,
    (query) => te.tryCatch(() => query, toDomainError("DB_READ_ERROR")),
    te.map((rows) => rows[0]),
  )
```

### Insert/Update

```typescript
let updateUser = (sql: Sql, userId: string, name: string) =>
  pipe(
    sql`update users set name = ${name} where id = ${userId}`,
    (query) => te.tryCatch(() => query, toDomainError("DB_WRITE_ERROR")),
    te.map(() => void 0),
  )
```

## Dependencies Pattern

Define your dependencies type:

```typescript
type Deps = {
  mainDb: Sql
  env: {
    DATABASE_URL: string
    API_KEY: string
  }
  logger?: Logger
}
```

Pass dependencies through the handler:

```typescript
export let registerRoutes = (fastify: FastifyInstance, deps: Deps) => {
  registerEndpoint1(fastify, deps)
  registerEndpoint2(fastify, deps)
  registerEndpoint3(fastify, deps)
}
```

