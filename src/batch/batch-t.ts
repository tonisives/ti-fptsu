import { pipe } from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"
import * as T from "fp-ts/lib/Task.js"

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
export let batchWithLimit =
  <A>(limit: number) =>
  (tasks: Array<T.Task<A>>): T.Task<Array<A>> =>
    pipe(
      tasks,
      A.chunksOf(limit),
      A.map(A.sequence(T.ApplicativePar)),
      A.sequence(T.ApplicativeSeq),
      T.map(A.flatten),
    ) as T.Task<Array<A>>

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
export let batchWithDelay =
  (delay: number) =>
  <A>(tasks: Array<T.Task<A>>): T.Task<Array<A>> =>
    pipe(
      tasks,
      A.mapWithIndex((i, task) => T.delay(delay * i)(task)),
      A.sequence(T.ApplicativePar),
    ) as T.Task<Array<A>>
