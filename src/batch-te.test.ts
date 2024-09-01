import { expect, it } from "vitest"
import { E, TE, pipe } from "./lib"
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
