import * as T from "fp-ts/lib/Task.js";
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
export declare let batchWithLimit: <A>(limit: number) => (tasks: Array<T.Task<A>>) => T.Task<Array<A>>;
/**
 * ! Note that this has some kind of issue of not catching errors from upper level
 * try {} catch {} blocks. Whole app crashes.
 *
 * --
 *
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
export declare let batchWithDelay: (delay: number) => <A>(tasks: Array<T.Task<A>>) => T.Task<Array<A>>;
