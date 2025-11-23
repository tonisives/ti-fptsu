different fp-ts utils

## ESLint Plugin

This package includes `eslint-plugin-fpts-style`, a custom ESLint plugin that enforces fp-ts functional programming best practices. The plugin provides 18 rules to ensure consistent, maintainable fp-ts code:

**Core Style Rules:**

- `no-statements-outside-pipe` - Functions must return a single pipe expression
- `prefer-flatmap-over-chain` - Use `flatMap` instead of deprecated `chain`/`chainW`
- `no-nested-pipes` - Prevents deeply nested pipes (configurable threshold)
- `no-long-inline-functions-in-pipe` - Extract long inline functions (max 5 lines by default)
- `prefer-concise-arrow-function` - Encourages concise arrow function syntax
- `prefer-merged-short-pipes` - Suggests merging short consecutive pipes

**Code Quality:**

- `no-const-variables` - Prefer `let` over `const` (except UPPER_CASE constants)
- `no-async-await` - Use TaskEither instead of async/await
- `enforce-file-layout` - Exports first, then private helpers
- `no-pipe-in-brackets` - Prevents pipes wrapped in unnecessary brackets
- `no-unnecessary-currying` - Simplifies overly-curried functions
- `prefer-grouped-parameters` - Groups related parameters for readability

**fp-ts Specific:**

- `no-fp-ts-lib-imports` - Use ti-fptsu aliases instead of direct fp-ts imports
- `prefer-a-map` - Use `a.map` instead of native array `.map()` in fp-ts code
- `simplify-task-constructors` - Simplifies Task/TaskEither constructor patterns
- `prefer-flow-over-pipe` - Use `flow` for function composition
- `require-flatmap-for-task-returns` - Ensures proper flatMap when returning Tasks
- `no-unnecessary-thunk-in-io-of` - Removes unnecessary thunks in IO.of

Many rules are auto-fixable with `--fix`. See [eslint-plugin-fpts-style/README.md](./eslint-plugin-fpts-style/README.md) for detailed documentation and examples.

## Installation

```sh
yarn add fp-ts ti-fptsu
```

### Adding ESLint to Your Project

To use the `eslint-plugin-fpts-style` plugin in your project:

1. Install dependencies:

```bash
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-fpts-style
```

2. Add to your `package.json`:

```json
{
  "scripts": {
    "lint": "pnpm eslint"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-fpts-style": "^3.1.0"
  }
}
```

3. Configure ESLint (see eslint-plugin-fpts-style documentation for configuration examples)

## Usage

### Simplified fp-ts imports

Instead of importing from fp-ts directly, use the shorter aliases:

```typescript
import { te, o, e, a, pipe } from "ti-fptsu/lib"

// Instead of:
// import * as TE from "fp-ts/lib/TaskEither.js"
// import * as O from "fp-ts/lib/Option.js"
// import * as E from "fp-ts/lib/Either.js"
// import * as A from "fp-ts/lib/Array.js"
// import { pipe } from "fp-ts/lib/function.js"

let result = pipe(
  te.of(42),
  te.map((x) => x * 2),
  te.flatMap((x) => te.of(x + 1)),
)
```

**Available aliases:**

- `te` - TaskEither
- `t` - Task
- `rte` - ReaderTaskEither
- `o` - Option
- `e` - Either
- `a` - Array
- `nea` - NonEmptyArray
- `b` - boolean
- `io` - IO
- `pipe` - function pipe
- `flow` - function flow

**Type aliases:**

- `TaskE<E, A>` - TaskEither<E, A>
- `ReaderTE<R, E, A>` - ReaderTaskEither<R, E, A>
- `Opt<A>` - Option<A>
