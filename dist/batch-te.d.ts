import * as TE from "fp-ts/lib/TaskEither.js";
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
export declare let batchWithLimit: <E, A>(limit: number) => (tasks: Array<TE.TaskEither<E, A>>) => TE.TaskEither<E, Array<A>>;
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
export declare let batchWithDelay: <E, A>(delay: number) => (tasks: Array<TE.TaskEither<E, A>>) => TE.TaskEither<E, Array<A>>;
