import { expect, it } from "vitest"
import { E, T, TE, flow, pipe } from "./lib"
import { batchWithDelay } from "./batch-te"

it("delays a batch", async () => {
  let delay = 100
  let resultTimes = [] as number[]
  let jobs: TE.TaskEither<Error, any>[] = [
    () => {
      resultTimes.push(Date.now())
      return Promise.resolve(E.of(1))
    },
    () => {
      resultTimes.push(Date.now())
      return Promise.resolve(E.of(1))
    },
    () => {
      resultTimes.push(Date.now())
      return Promise.resolve(E.of(1))
    },
  ]

  await pipe(batchWithDelay(delay)(jobs))()

  expect(resultTimes[1] - resultTimes[0]).toBeGreaterThan(delay * 0.9)
  expect(resultTimes[2] - resultTimes[1]).toBeGreaterThan(delay * 0.9)
  expect(resultTimes[2] - resultTimes[0]).toBeGreaterThan(delay * 0.9)
})

/* The main thing to note here is that we need to return a function that returns Promise<Either>,
 * and not call it before the batchWithDelay. Otherwise, the delay will not work.
 */
it("delays for fun ref", async () => {
  let delay = 100
  let resultTimes = [] as number[]
  let jobs: TE.TaskEither<Error, any>[] = [
    getPipeJob(resultTimes),
    getPipeJob(resultTimes),
    getPipeJob(resultTimes),
  ]

  await pipe(batchWithDelay(delay)(jobs))()

  console.log(resultTimes)

  expect(resultTimes[1] - resultTimes[0]).toBeGreaterThan(delay * 0.9)
  expect(resultTimes[2] - resultTimes[1]).toBeGreaterThan(delay * 0.9)
  expect(resultTimes[2] - resultTimes[0]).toBeGreaterThan(delay * 0.9)
})

let getJob = (startTimes: number[]) => async () => {
  startTimes.push(Date.now())
  return E.of(1)
}
// if we call the flow, then it starts running the functions
let getPipeJob = (startTimes: number[]) =>
  pipe(
    TE.of(1),
    TE.map(() => startTimes.push(Date.now())),
    TE.map((it) => it),
  )
