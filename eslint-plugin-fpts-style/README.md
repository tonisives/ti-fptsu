# eslint-plugin-fpts-style

Custom ESLint plugin to enforce fp-ts coding standards based on your functional programming style guide.

## Rules

### fpts-style/no-statements-outside-pipe (error)

Ensures functions return a single pipe expression without statements outside the pipe.

**Bad:**
```ts
export let processToken = ({ token, deps }: ProcessTokenProps) => {
  setStablesModeSync(token.token_ca, deps)  // Statement outside pipe

  return pipe(
    metrics.tokenDuration.start(token.token_ca),
    // ...
  )
}
```

**Good:**
```ts
export let processToken = ({ token, deps }: ProcessTokenProps) =>
  pipe(
    te.of(setStablesModeSync(token.token_ca, deps)),
    te.flatMap(() => metrics.tokenDuration.start(token.token_ca)),
    // ...
  )
```

### fpts-style/prefer-flatmap-over-chain (error, fixable)

Enforces using `flatMap` instead of deprecated `chain` or `chainW` methods.

**Bad:**
```ts
pipe(
  te.of(value),
  te.chain(processValue),
  te.chainW(transform),
)
```

**Good:**
```ts
pipe(
  te.of(value),
  te.flatMap(processValue),
  te.flatMap(transform),
)
```

This rule is auto-fixable with `--fix`.

### fpts-style/no-nested-pipes (error)

Prevents nested pipe expressions. Extract inner pipes to separate functions.

**Default:** Allows small nested pipes with 3 or fewer arguments.

**Configuration:** You can customize the threshold or disable nested pipes entirely:
```js
"fpts-style/no-nested-pipes": ["error", { maxNestedPipeArgs: 3 }]  // Default
"fpts-style/no-nested-pipes": ["error", { maxNestedPipeArgs: 0 }]  // Disable all nested pipes
"fpts-style/no-nested-pipes": ["error", { maxNestedPipeArgs: 5 }]  // Allow up to 5 arguments
```

**Bad:**
```ts
pipe(
  workTe(),
  te.flatMap(() =>
    pipe(  // Nested pipe with 4+ arguments
      checkResultTe(),
      te.map(transform),
      te.flatMap(validate),
      te.map(finalize)
    )
  )
)
```

**Good:**
```ts
let checkAndContinue = () =>
  pipe(
    checkResultTe(),
    te.flatMap(continueWork)
  )

pipe(
  workTe(),
  te.flatMap(checkAndContinue)
)
```

**Also Good (small nested pipe):**
```ts
pipe(
  workTe(),
  te.flatMap(() =>
    pipe(  // Small nested pipe (3 arguments) is allowed
      checkResultTe(),
      te.map(transform)
    )
  )
)
```

### fpts-style/no-const-variables (warn, fixable)

Enforces using `let` instead of `const` for variable declarations, except for top-level UPPER_CASE constants.

**Bad:**
```ts
const userId = getUserId()
const result = pipe(...)
```

**Good:**
```ts
let userId = getUserId()
let result = pipe(...)

// Top-level constants are allowed
const API_TIMEOUT = 5000
const MAX_RETRIES = 3
```

This rule is auto-fixable with `--fix`.

### fpts-style/no-async-await (error)

Disallows async functions and await inside functions. Use Task or TaskEither from fp-ts instead.

**Exception:** Top-level `await` is allowed for running main functions.

**Bad:**
```ts
// async functions not allowed
let fetchData = async () => {
  const result = await fetch(url)
  return result
}

// async in te.tryCatch not allowed - use function pointer instead
let job = te.tryCatch(async () => {
  await someOperation()
  return result
}, toError)

// await inside functions not allowed
let process = () => {
  await someTask()  // Error
}
```

**Good:**
```ts
// Use TaskEither instead of async
let fetchData = () =>
  pipe(
    te.tryCatch(
      () => fetch(url),
      toDomainError("FETCH_ERROR")
    ),
    te.map(processResult)
  )

// For te.tryCatch, use a separate function pointer
let asyncFn = async () => {
  await someOperation()
  return result
}
let job = te.tryCatch(asyncFn, toError)

// Top-level await is allowed
await mainTask()
```

### fpts-style/no-long-inline-functions-in-pipe (error)

Disallows long inline functions inside pipe expressions. Inline functions should be extracted to named functions for better readability and testability.

**Default:** Maximum 5 lines allowed for inline functions.

**Configuration:** You can customize the maximum lines allowed:
```js
"fpts-style/no-long-inline-functions-in-pipe": ["error", { maxLines: 5 }]
```

**Bad:**
```ts
pipe(
  getData(),
  te.match(
    (error) => {
      if (error.error === "NOT_FOUND") {
        let response = createErrorResponse("NOT_FOUND", "No active subscription found")
        return reply.status(404).send(response)
      }
      let response = createErrorResponse(error.error, error.message || "Failed")
      return reply.status(500).send(response)
    },
    (data) => reply.send(createSuccessResponse(data))
  )
)
```

**Good:**
```ts
let handleError = (error: DomainError) => {
  if (error.error === "NOT_FOUND") {
    let response = createErrorResponse("NOT_FOUND", "No active subscription found")
    return reply.status(404).send(response)
  }
  let response = createErrorResponse(error.error, error.message || "Failed")
  return reply.status(500).send(response)
}

let handleSuccess = (data: Data) => reply.send(createSuccessResponse(data))

pipe(
  getData(),
  te.match(handleError, handleSuccess)
)
```

### fpts-style/enforce-file-layout (error)

Enforces a consistent file layout where all exported items (types, functions, constants) come first, followed by private helper functions.

**Bad:**
```ts
const privateHelper = () => {
  // implementation
}

export const publicApi = () => {  // Error: export after private
  // implementation
}
```

**Good:**
```ts
export const publicApi = () => {
  // implementation
}

const privateHelper = () => {
  // implementation
}
```

**Another Good Example:**
```ts
export type User = { name: string }
export const createUser = (name: string): User => ({ name })
export const validateUser = (user: User) => user.name.length > 0

const sanitizeName = (name: string) => name.trim()
const checkNameLength = (name: string) => name.length > 0
```

## Usage

The plugin is automatically configured in your project. Run:

```bash
pnpm lint                 # Check for issues
pnpm lint:fix            # Auto-fix issues where possible
```

## Installation

This plugin is located in the ti-fptsu repository. To use it in your project:

1. Add to your `package.json`:

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-fpts-style": "file:/Users/tonis/workspace/tgs/js/ti-fptsu/eslint-plugin-fpts-style"
  }
}
```

2. Create `eslint.config.js` in your project root:

```js
const tsParser = require("@typescript-eslint/parser")
const fptsStyle = require("eslint-plugin-fpts-style")

module.exports = [
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      "fpts-style": fptsStyle,
    },
    rules: {
      "fpts-style/no-statements-outside-pipe": "error",
      "fpts-style/prefer-flatmap-over-chain": "error",
      "fpts-style/no-nested-pipes": "error",
      "fpts-style/no-const-variables": "warn",
      "fpts-style/no-async-await": "error",
      "fpts-style/prefer-a-map": "error",
      "fpts-style/no-long-inline-functions-in-pipe": ["error", { maxLines: 5 }],
      "fpts-style/enforce-file-layout": "error",
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },
]
```

3. Add scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix"
  }
}
```
