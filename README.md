DynamoDB documentClient batch helper functions

## Installation

```
yarn add fp-ts logging-ts ti-fptsu@tonisives/ti-fptsu
```

## Usage

```typescript
await pipe(
    TE.Do,
    TE.bind("input", () => pipe(validateInput(event), TE.fromEither)),
    log(() => "checking conditions"),
    TE.bind("pre", () => sequenceT(TE.ApplicativePar)(
    ...

    )))
```