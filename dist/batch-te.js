import { pipe } from "fp-ts/lib/function.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { T } from "./lib.js";
/**
 * batch in parallel with limited concurrency
 *
 * @example
 * await pipe(
 *   batchTasks<ChecklistItemBase | Error>(5)(
 *       getStoreJobs(results, existingCl, stored)
 *   )
 * )()
 */
export let batchWithLimit = (limit) => (tasks) => pipe(tasks, A.chunksOf(limit), A.map(A.sequence(TE.ApplicativePar)), A.sequence(TE.ApplicativeSeq), TE.map(A.flatten));
/**
 * Batch with delay for each item
 *
 * @example
 * let getStoreJob = async (oldUser: Record<string, any>) => {
 *   oldUser.pk = newPk
 *   return await dbClient.send(
 *     new PutItemCommand({
 *       TableName: "ah_user_1",
 *       Item: oldUser,
 *     }),
 *   )
 * }
 *
 * let runJobs = async (oldUsers: Record<string, any>[]) => {
 *   let jobs = oldUsers.map((it) => () => getStoreJob(it))
 *   await pipe(batchWithDelay(30)(jobs))()
 * }
 */
export let batchWithDelay = (delay) => (tasks) => pipe(tasks, A.mapWithIndex((i, task) => T.delay(delay * i)(task)), A.sequence(TE.ApplicativePar));
//# sourceMappingURL=batch-te.js.map