import { vi, expect, it } from "vitest"
import { pipe, TE } from "./lib.js"
import { batchWithDelay } from "./batch.js"

// prettier-ignore
it("inferences type", () => {
  let res = 
    pipe(
      [TE.of(1), TE.of(2)] as TE.TaskEither<Error, number>[],
      batchWithDelay(10)
    )
})
