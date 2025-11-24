# eslint-plugin-fpts-style

Custom ESLint plugin to enforce fp-ts coding standards based on your functional programming style guide.

This plugin helps maintain consistent fp-ts code style, especially when working with AI code generation. It encodes fp-ts best practices into automated rules that catch common issues like nested pipes, deprecated functions, and imperative patterns.

Read the full guide: [AI-Driven Functional Programming in TypeScript](https://tonisives.com/blog/2025/11/23/ai-driven-fp-ts-development/)

## Rules

### fpts-style/no-statements-outside-pipe (error)

Ensures functions return a single pipe expression without statements outside the pipe. This maintains explicit data flow and prevents hidden side effects.

**Bad:**

```ts
export let processToken = ({ token, deps }: ProcessTokenProps) => {
  setStablesModeSync(token.token_ca, deps) // Statement outside pipe

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

**Another Good Example:**

```ts
let processUser = (userId: string) =>
  pipe(
    validateUserId(userId),
    te.fromEither,
    te.tapIO(() => io.of(console.log("Processing user:", userId))),
    te.flatMap(fetchUser),
  )
```

Everything in the pipe means explicit data flow, clearly marked side effects with `tapIO`, and no hidden state.

### fpts-style/prefer-flatmap-over-chain (error, fixable)

Enforces using `flatMap` and `tap` instead of deprecated `chain`, `chainW`, and `chainFirst` methods. fp-ts has modernized its API to use more standard functional programming terminology.

**Bad:**

```ts
pipe(te.of(value), te.chain(processValue), te.chainW(transform), te.chainFirst(logResult))
```

**Good:**

```ts
pipe(te.of(value), te.flatMap(processValue), te.flatMap(transform), te.tap(logResult))
```

This rule is auto-fixable with `--fix`. The error message teaches AI which imports to use for modern fp-ts code.

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
    pipe(
      // Nested pipe with 4+ arguments
      checkResultTe(),
      te.map(transform),
      te.flatMap(validate),
      te.map(finalize),
    ),
  ),
)
```

**Good:**

```ts
let checkAndContinue = () => pipe(checkResultTe(), te.flatMap(continueWork))

pipe(workTe(), te.flatMap(checkAndContinue))
```

**Also Good (small nested pipe):**

```ts
pipe(
  workTe(),
  te.flatMap(() =>
    pipe(
      // Small nested pipe (3 arguments) is allowed
      checkResultTe(),
      te.map(transform),
    ),
  ),
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

Disallows async functions and await inside functions. Use Task or TaskEither from fp-ts instead. This ensures functional composition and typed error handling throughout your codebase.

**Exception:** Top-level `await` is allowed for running main functions.

**Why this matters:** `async/await` breaks functional composition and forces you back into imperative land with `try/catch` blocks. TaskEither maintains composability and typed errors.

**Bad:**

```ts
// async functions break composition
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch user", error)
    throw error
  }
}

// async in te.tryCatch not allowed - use function pointer instead
let job = te.tryCatch(async () => {
  await someOperation()
  return result
}, toError)
```

**Good:**

```ts
// Functional version composes cleanly with typed errors
let fetchUserData = (userId: string): TaskE<AnyError, UserData> =>
  pipe(
    te.tryCatch(
      () => fetch(`/api/users/${userId}`).then((r) => r.json()),
      toDomainError("FETCH_USER_ERROR"),
    ),
  )

// For te.tryCatch, use a separate function pointer
let asyncFn = async () => {
  await someOperation()
  return result
}
let job = te.tryCatch(asyncFn, toError)

// Top-level await is allowed for main entry points
await mainTask()
```

### fpts-style/no-long-inline-functions-in-pipe (error)

Disallows long inline functions inside pipe expressions. Long inline functions hurt readability and testability - you can't easily test a 20-line arrow function buried in a pipe.

**Default:** Maximum 5 lines allowed for inline functions.

**Configuration:** You can customize the maximum lines allowed:

```js
"fpts-style/no-long-inline-functions-in-pipe": ["error", { maxLines: 5 }]
```

**Bad:**

```ts
pipe(
  getUserId(request),
  te.flatMap((userId) =>
    pipe(
      te.tryCatch(() => db.query("SELECT * FROM users WHERE id = $1", [userId]), toDbError),
      te.flatMap((rows) => {
        if (rows.length === 0) return te.left(notFoundError("User not found"))
        let user = rows[0]
        let validated = validateUserSchema(user)
        if (e.isLeft(validated)) return te.left(validationError(validated.left))
        return te.right(validated.right)
      }),
      te.flatMap((user) => enrichUserWithPreferences(db, user)),
    ),
  ),
)
```

**Good:**

```ts
let fetchUserFromDb =
  (db: Database) =>
  (userId: string): TaskE<AppError, User> =>
    pipe(
      te.tryCatch(() => db.query("SELECT * FROM users WHERE id = $1", [userId]), toDbError),
      te.flatMap(validateUserRows),
      te.flatMap(enrichUserWithPreferences(db)),
    )

pipe(getUserId(request), te.flatMap(fetchUserFromDb(db)))
```

Each extracted function can be tested independently and reused elsewhere.

### fpts-style/prefer-a-map (error)

Enforces using `a.map` from fp-ts/Array instead of native `array.map()` for consistency in functional code.

**Bad:**

```ts
let userIds = users.map((u) => u.id)
let names = users.map((u) => u.name)
```

**Good:**

```ts
import { pipe } from "ti-fptsu/lib"
import * as a from "fp-ts/Array"

let userIds = pipe(
  users,
  a.map((u) => u.id),
)
let names = pipe(
  users,
  a.map((u) => u.name),
)
```

While more verbose, this maintains consistency and enables better composition with other fp-ts array operations like `a.filter`, `a.flatMap`, etc.

### fpts-style/enforce-file-layout (error)

Enforces a consistent file layout where all exported items (types, functions, constants) come first, followed by private helper functions. This helps both humans and AI navigate the codebase.

**Bad:**

```ts
let privateHelper = (x: number) => x * 2

export type User = { id: string; name: string }

let anotherHelper = (s: string) => s.toUpperCase()

export let processUser = (user: User) => ...

export type Config = { apiKey: string }
```

**Good:**

```ts
// Exports first
export type User = { id: string; name: string }
export type Config = { apiKey: string }

export let processUser = (user: User) =>
  pipe(
    user,
    validateUser,
    enrichUser
  )

// Private functions after
let validateUser = (user: User) => ...
let enrichUser = (user: User) => ...
```

## Real-World Examples

Here are actual production examples showing these patterns in action:

### API Route Handler with Validation

```typescript
export let handleGetSimilarIdeasRoute =
  (db: Db) => (request: FastifyRequest, reply: FastifyReply) =>
    pipe(
      validateSimilarIdeasParams(request.params || {}, request.query || {}),
      e.fold(
        (validationError) => te.left(validationError),
        ({ params, query }) =>
          fetchSimilarIdeasForValidatedIdea(db, getUserTier(request), query, params),
      ),
      te.map(sendSimilarIdeasSuccess(reply)),
      te.mapLeft(sendIdeaErrorResponse(reply)),
    )
```

Clean separation: validate with Either, fold into TaskEither, process business logic, handle both success and error paths.

### Parallel Operations with sequenceS

```typescript
let buildResultWithPremiumData = (
  sql: Db,
  filters: BusinessIdeaFilters,
  ideas: BusinessIdea[],
): TaskE<MyError, BusinessIdeasResult> =>
  pipe(
    fetchPremiumCountFromDb(sql, filters),
    te.map(parsePremiumCount),
    te.flatMap((premiumCount) => fetchPremiumData(sql, filters, premiumCount)),
    te.map((data) => buildPremiumResult(filters, ideas, data)),
  )

let fetchPremiumData = (sql: Db, filters: BusinessIdeaFilters, premiumCount: number) =>
  pipe(
    {
      premiumIdeas: getPremiumIdeas(sql, filters),
      allIdeas: getAllIdeasForCategoryDistribution(sql, filters),
    },
    sequenceS(te.ApplicativePar),
    te.map((data) => ({ ...data, premiumCount })),
  )
```

Multiple database queries running in parallel with `sequenceS`, then combined into a single result.

### External API Integration with Error Handling

```typescript
export let cancelSubscription =
  (subDb: SubscriptionDb, axiom: AppAxiom) =>
  (userId: string): TaskE<AnyError | ApiError, Subscription> =>
    pipe(
      getSubscriptionByUserId(subDb)(userId),
      te.flatMap((subscription) =>
        subscription && subscription.stripe_subscription_id
          ? te.of(subscription.stripe_subscription_id)
          : te.left(domainError("NOT_FOUND", "No active subscription found")),
      ),
      te.tapIO(() => io.of(axiom.info(`Canceling subscription for user ${userId}`))),
      te.flatMap(updateStripeCancelation),
      te.flatMap(() =>
        updateSubscription(subDb)(userId, {
          cancel_at_period_end: true,
        }),
      ),
      te.tapIO(() =>
        io.of(axiom.info(`Subscription canceled for user ${userId}, will end at period end`)),
      ),
      te.mapLeft((error) => {
        axiom.error(error, { userId }, "error")
        return error
      }),
    )
```

Stripe API integration, database updates, logging with `tapIO`, and error handling - all in a linear, readable pipe.

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
      ...fptsStyle.configs.recommended.rules,
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

## Why This Matters

### The AI Code Generation Challenge

Large language models struggle with fp-ts because:

1. **TypeScript's dual nature**: TypeScript supports both OOP and functional programming, and LLMs mix them freely
2. **fp-ts evolution**: Deprecated functions like `chain` remain prevalent in training data
3. **Limited adoption**: Compared to mainstream libraries, fp-ts has less training data

The result? AI-generated code that technically works but violates fp-ts principles: nested pipes, mixed async patterns, massive inline functions, and deprecated APIs.

### The Solution: Rigid Standards

As Chris Weichel noted in a [Software Engineering Daily interview](https://softwareengineeringdaily.com/2025/10/23/turning-agent-autonomy-into-productivity-with-chris-weichel/):

> "Agents are like a jet engine that you can strap on to your plane. Either your air frame is rigid enough to withstand the acceleration and velocity, and then you're going to go very far, very fast, or you're going to come undone in mid-air."

**ESLint is your airframe.** These rules don't just catch errors - they guide AI toward correct patterns through error messages and auto-fix suggestions.

### Results After Production Use

- **Consistency**: AI generates predictable fp-ts code without random paradigm switches
- **Readability**: Clean pipes with function pointers instead of massive inline functions
- **Fewer bugs**: Typed error handling catches edge cases at compile time
- **Faster reviews**: Focus on business logic, not style inconsistencies
- **Better AI understanding**: Consistent style helps AI reason about its own code in follow-up iterations

## Key Principles

The rules encode these principles:

- **Consistency over flexibility**: One right way helps both AI and humans
- **Auto-fix where possible**: Reduce friction with automatic refactoring
- **Configurable thresholds**: Allow small violations while preventing egregious cases
- **Error messages guide AI**: Messages teach AI which patterns to use
- **Progressive enforcement**: Warnings for style, errors for breaking changes
