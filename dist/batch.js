import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";
import * as T from "fp-ts/lib/Task.js";
export let batchTasks = (limit) => (tasks) => pipe(tasks, A.chunksOf(limit), A.map(A.sequence(T.ApplicativePar)), A.sequence(T.ApplicativeSeq), T.map(A.flatten));
//# sourceMappingURL=batch.js.map