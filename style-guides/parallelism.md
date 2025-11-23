### Parallelism

#### Run array of tasks in parallel/sequence

Always use a.traverse

```ts
pipe(
  getArrayOfTx(), // () => tx[]
  a.traverse(te.ApplicativePar)((tx => myTaskE(tx) // can pipe straight into a.traverse
  // use ApplicativeSeq for sequential
)
```

#### Run different tasks in parallel/sequence

Never use te.Do. Always prefer sequenceS/T

Construct dependencies with sequenceS,

```ts
pipe(
  {
    res1: myTask1(),
    res2: myTask2(),
  },
  sequenceS(te.ApplicativePar), // or io.ApplicativePar
  te.tap({res1, res2} => sideEffect(res2)),
  te.flatMap({res1, res2}) => continue(res1, res2)
)
```
, or build the state with multiple jobs
```ts

pipe(
  myTaskE1(),
  te.flatMap(myTask2)
  te.tap({res1, res2} => sideEffect(res2)),
  te.flatMap({res1, res2}) => continue(res1, res2)
)

let myTask2 = (res1) => pipe(doWork(res1), te.flatMap(res2 => ({res1, res2})))
```

