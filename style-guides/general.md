# Typescript-Specific Rules

## Build system

build `pnpm -F packages/email-service build`
check types: `tsc --noEmit --project packages/email-service`
test: `pnpm exec vitest run`

### FORBIDDEN - NEVER DO THESE

- **NO Classes** - use functional programming style
- **NO interfaces** - use type
- **NO functions** - use arrow functions
- NO await/async functions, always use Task or TaskE
- NO deviation - only use the style from the code samples below

### Required Standards

- **fp-ts library with e, te, rte, o shorthands**: make code functional
- **Early returns**: reduce nesting
- **Functions return expressions**: prefer functions that don't use brackets, and return a single expression without the return keyword
- **Small functions that achieve a single task**: make code easier to read and reason
- **use let** - only use const for top of file constants

### File structure

1. exported types/functions/constants
2. private functions

## fp-ts style

- No nested pipes - always define a new function
  ❌

  ```ts
  pipe(
    workTe(),
    te.flatMap(() =>
      pipe(
        checkResultTe(),
        te.flatMap(() =>
          pipe(...)
          )
        )
     )
  )
  ```

  ✅

  ```ts
  pipe(
    workTe(),
    te.flatMap(moreWorkTe),
    te.tap(sideEffect()),
    te.flatMap(doEvenMoreWork)
  )
  ```

  ✅

  ```ts
  pipe(
    {
      res1: myTaskE1(),
      res2: myTaskE2(),
    },
    sequenceS(te.ApplicativePar),
    te.tap({res1, res2} => sideEffect(res2)),
    te.flatMap({res1, res2}) => continue(res1, res2)
  )
  ```

- return pipe as expression: `let job = () => pipe(...)`

- Mainly use TaskEither(te) and ReaderTaskEiter(rte)

### sample flow with TaskE

```ts
let updateCache =
  (state: ChunkState) =>
  ({ token, cache }: HistDeps): TaskE<AnyError, ChunkState> =>
    pipe(
      state.tx.map(getTa),
      te.fromPredicate(ta => ta.length > 0, () => "no tx"),
      te.tap(() => delay(200)),
      te.flatMap(ta => cache.addTokenAccounts(token.token_ca, getLastBn(state), ta)),
      te.tap(() => te.of(l.traceL(() => `add tfe ${state.tx.length}`))),
      te.orElse(logGuardR(state)),
    ))
```

### sample job flow with ReaderTE

```ts
export let runJob = (): ReaderTE<JobDeps, AnyError, void> =>
  pipe(
    logStart(),
    rte.flatMap(createFirstState),
    rte.flatMap(state => (deps: JobDeps) => parse()({ ...deps, state })),
    rte.flatMap(cleanupCache),
    rte.map(logEnd),
    rte.map(() => void 0),
  )
```

Notice how we use clean pipes with function pointers only. You need to define clear functions and use pointers to these for the specific tasks

### Try-catch

Use toDomainError("ERROR_CODE") in catch block

```ts
pipe(
  te.tryCatch(
    () => readDb(),
    toDomainError("DB_READ_ERROR"),
  ),
  te.map(a.map(getFirstColumn))
)
```

### Lifting monads

Try to use the least necessary monad for each operation, while keeping clean code

```ts
export let fetchPlaces = (params: SearchParams): TaskE<AnyError, Location[]> =>
  pipe(
    io.of(calculateLimits(params)),
    io.tap(({ limit }) => logFetchInfo(params, limit)),
    io.flatMap(({ limit }) => fetchBothTypes(params, limit)),
    te.map(convertToLocations(params)),
  )
```

### Array functions

Prefer fp-ts Array (a) instead of js extension functions

```ts
  pipe(
    [1, 2, 3],
    a.reduce(0, (acc, query) => acc + 1)
  )
```

### Logging

Use `tapIO` inside pipe.

```ts
  pipe(
    state.tx.map(getTa),
    te.tapIO(() => io.of(l.traceL(() => `starting job`))),
    te.flatMap(() => startJob()),
  )
```

### helper functions

```ts
export let delay = (ms: number) =>
  te.fromTask(() => t.delay(1000))
```

## Application Startup & Error Handling

### Job/App Entry Point Pattern

Structure your main entry point with proper error handling, resource cleanup, and observability:

```ts
import { pipe, te, io, t } from "ti-fptsu/lib"
import { createAxiom } from "shared/axiom"
import type { AppAxiom } from "shared/axiom"
import { handleError } from "./util/errors.js"
import { toDomainError } from "shared/errors"
import {
  setupGracefulShutdown,
  registerJobLockCleanup,
  registerDbCleanup,
  registerAxiomClient,
  registerAxiomFlush,
} from "./util/shutdown.js"

let JOB_NAME = "my_job"

// Setup graceful shutdown handlers at module level
setupGracefulShutdown()

// Validate required env vars early
let apiKey = process.env.API_KEY
if (!apiKey) {
  l.error("API_KEY environment variable is required")
  process.exit(1)
}

type JobResult = { count: number; axiom: AppAxiom }
type JobError = { error: any; axiom?: AppAxiom; db?: any }
type JobContext = { db: any; axiom: AppAxiom; env: MyEnv }
```

### Environment Validation

Create a minimal env validation for each job:

```ts
type JobEnv = {
  DATABASE_URL: string
  API_KEY: string
  AXIOM_TOKEN: string
  AXIOM_DATASET: string
}

let getJobEnv = (): te.TaskEither<any, JobEnv> => {
  let dbUrl = process.env.DATABASE_URL
  let apiKey = process.env.API_KEY
  let axiomToken = process.env.AXIOM_TOKEN
  let axiomDataset = process.env.AXIOM_DATASET

  if (!dbUrl) return te.left(toDomainError("CONFIG_ERROR")(new Error("DATABASE_URL is required")))
  if (!apiKey) return te.left(toDomainError("CONFIG_ERROR")(new Error("API_KEY is required")))
  if (!axiomToken) return te.left(toDomainError("CONFIG_ERROR")(new Error("AXIOM_TOKEN is required")))
  if (!axiomDataset) return te.left(toDomainError("CONFIG_ERROR")(new Error("AXIOM_DATASET is required")))

  return te.right({ DATABASE_URL: dbUrl, API_KEY: apiKey, AXIOM_TOKEN: axiomToken, AXIOM_DATASET: axiomDataset })
}
```

### Setup Environment with Cleanup Handlers

```ts
let registerCleanupHandlers = (db: any, axiom: AppAxiom): te.TaskEither<never, void> =>
  te.fromIO(() => {
    registerAxiomClient(axiom)
    registerAxiomFlush(axiom)
    registerJobLockCleanup(db, JOB_NAME)
    registerDbCleanup(db)
  })

let setupEnvironment = (env: JobEnv) =>
  pipe(
    te.of({
      db: postgres(env.DATABASE_URL) as any,
      axiom: createAxiom({
        AXIOM_TOKEN: env.AXIOM_TOKEN,
        AXIOM_DATASET: env.AXIOM_DATASET,
      }),
      env
    }),
    te.tap(({ db, axiom }) => registerCleanupHandlers(db, axiom))
  )
```

### Error Handling Pattern

```ts
// Log error to Axiom
let logAxiomError = (axiom: AppAxiom, error: any) =>
  te.of(axiom.error(error, { job: JOB_NAME, context: "job_failure" }))

// Handle expected errors (lock already held, no work, etc.)
let isExpectedError = (errorType: string) =>
  errorType === "JOB_ALREADY_RUNNING" || errorType === "NO_WORK"

let handleJobError = (result: JobError): any =>
  isExpectedError(result.error)
    ? te.right({ count: 0, axiom: result.axiom! } as JobResult)
    : pipe(
        te.left(result),
        te.tap(() => result.axiom ? logAxiomError(result.axiom, result.error) : te.right(undefined)),
        te.tap(() => result.db ? releaseJobLockAfterError(result.db) : te.right(undefined))
      )

// Handle final errors (env validation, unexpected errors)
let handleFinalError = (error: any): t.Task<void> => {
  l.error(`Job failed with error: ${JSON.stringify(error)}`)
  return () => handleError(error, JOB_NAME).then(() => {
    process.exit(1)
  })
}
```

### Success Handler with Axiom Flush

```ts
let flushAxiomOnExit = (axiom: AppAxiom): t.Task<void> =>
  pipe(
    axiom.flush(),
    te.fold(
      (err) => () => Promise.resolve(l.error(`Failed to flush Axiom on exit: ${err}`)),
      () => () => Promise.resolve(l.info("Axiom flushed on exit"))
    )
  )

let handleJobSuccess = (jobResult: JobResult): t.Task<void> => () => {
  let message = jobResult.count === 0
    ? `Job finished: No work done`
    : `Job finished successfully: ${jobResult.count} items processed`

  l.info(message)

  return flushAxiomOnExit(jobResult.axiom)().then(() => {
    setTimeout(() => process.exit(0), 100)
  })
}
```

### Main Execution Pipeline

```ts
let main = pipe(
  getJobEnv(),
  te.flatMap(setupEnvironment),
  te.flatMap(acquireLock),
  te.flatMap(doWork),
  te.orElse(handleJobError),
  te.fold(handleFinalError, handleJobSuccess),
)

let handleUnexpectedError = (error: any) => {
  l.error(`Unexpected error: ${JSON.stringify(error)}`)
  return handleError(error, JOB_NAME, "unexpected_error").then(() => {
    process.exit(1)
  })
}

main().catch(handleUnexpectedError)
```

### Key Principles

1. **Setup graceful shutdown early** - Call `setupGracefulShutdown()` at module level
2. **Register cleanup handlers** - Register Axiom, DB, and lock cleanup as soon as resources are created
3. **Validate env vars early** - Check required env vars before any async work
4. **Separate expected from unexpected errors** - Handle "no work" differently from actual failures
5. **Always flush Axiom** - Flush on both success and error paths
6. **Use proper Task types** - Return `t.Task<void>` from handlers, not raw Promises
7. **Log errors with context** - Include job name and error details in Axiom logs
8. **Exit cleanly** - Use `process.exit()` with appropriate codes after cleanup

### Shutdown Handler Pattern

Create a shutdown utility module:

```ts
// util/shutdown.ts
import { pipe, te, t } from "ti-fptsu/lib"
import { releaseJobLock } from "./db.js"
import type { AppAxiom } from "shared/axiom"

type ShutdownHandler = () => t.Task<void>
let shutdownHandlers: ShutdownHandler[] = []
let isShuttingDown = false
let globalAxiom: AppAxiom | undefined

export let registerShutdownHandler = (handler: ShutdownHandler): void => {
  shutdownHandlers.push(handler)
}

export let registerAxiomClient = (axiom: AppAxiom): void => {
  globalAxiom = axiom
}

export let registerJobLockCleanup = (db: any, jobName: string): void => {
  registerShutdownHandler(() => releaseLockHandler(db, jobName))
}

export let registerAxiomFlush = (axiom: AppAxiom): void => {
  registerShutdownHandler(() => flushAxiomHandler(axiom))
}

export let registerDbCleanup = (db: any): void => {
  registerShutdownHandler(() => closeDbHandler(db))
}

export let setupGracefulShutdown = (): void => {
  process.on("SIGTERM", () => executeShutdown("SIGTERM")())
  process.on("SIGINT", () => executeShutdown("SIGINT")())
}

let executeShutdown = (signal: string): t.Task<void> =>
  pipe(
    t.of(isShuttingDown),
    t.flatMap((shuttingDown) =>
      shuttingDown ? t.of(undefined) : performShutdown(signal)
    )
  )

let performShutdown = (signal: string): t.Task<void> =>
  pipe(
    t.of(void (isShuttingDown = true)),
    t.tap(() => t.of(l.info(`Received ${signal}, starting graceful shutdown...`))),
    t.flatMap(() => runHandlers()),
    t.tap(() => t.of(l.info("Graceful shutdown complete"))),
    t.map(() => process.exit(0))
  )

let runHandlers = (): t.Task<void> => () =>
  shutdownHandlers
    .reverse()
    .reduce(
      (acc, handler) =>
        acc.then(() =>
          handler()().catch((error: unknown) => {
            l.error(`Shutdown handler error: ${error}`)
          })
        ),
      Promise.resolve()
    )
```

## Schema validation
use `io-ts` library
