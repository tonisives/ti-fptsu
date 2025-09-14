different fp-ts utils

## Installation

```
yarn add fp-ts logging-ts io-ts chalk ti-fptsu@tonisives/ti-fptsu
```

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
    te.map(x => x * 2),
    te.flatMap(x => te.of(x + 1))
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

### batch with delay for each item

```typescript
let getStoreJob = async (oldUser: Record<string, any>) => {
  oldUser.pk = newPk
  return await dbClient.send(
    new PutItemCommand({
      TableName: "ah_user_1",
      Item: oldUser,
    }),
  )
}

let runJobs = async (oldUsers: Record<string, any>[]) => {
  let jobs = oldUsers.map((it) => () => getStoreJob(it))
  await pipe(batchWithDelay(30)(jobs))()
}

```

### batch in parallel with limited concurrency

```typescript
await pipe(
  batchTasks<ChecklistItemBase | Error>(5)(
    getStoreJobs(results, existingCl, stored)
  )
)()
```
