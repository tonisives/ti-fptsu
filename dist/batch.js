import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";
import * as T from "fp-ts/lib/Task.js";
export let batchWithLimit = (limit) => (tasks) => pipe(tasks, A.chunksOf(limit), A.map(A.sequence(T.ApplicativePar)), A.sequence(T.ApplicativeSeq), T.map(A.flatten));
export let batchWithDelay = (delay) => (tasks) => pipe(tasks, A.mapWithIndex((i, task) => T.delay(delay * i)(task)), A.sequence(T.ApplicativePar));
//# sourceMappingURL=batch.js.map