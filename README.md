different fp-ts utils

## Installation

```
yarn add fp-ts logging-ts io-ts chalk ti-fptsu@tonisives/ti-fptsu
```

## Usage

### logging

```typescript
await pipe(
    TE.Do,
    TE.bind("input", () => pipe(validateInput(event), TE.fromEither)),
    log(() => "checking conditions"),
    lgc("yellow", () => "yellow"),
    TE.bind("pre", () => sequenceT(TE.ApplicativePar)(
    ...

    )))
```

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
