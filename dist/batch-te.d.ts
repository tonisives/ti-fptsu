import * as TE from "fp-ts/lib/TaskEither.js";
/**
 * batch in parallel with limited concurrency
 *
 * @example
 * await pipe(
 *   batchTasks<Error, Result>(5)(
 *       getStoreJobs() as TE.TaskEither<Error, Result>[]
 *   )
 * )()
 */
export declare let batchWithLimit: <E, A>(limit: number) => (tasks: Array<TE.TaskEither<E, A>>) => TE.TaskEither<E, Array<A>>;
/**
 * Batch with delay for each item
 *
 * @example
 * let getStoreJob = async (oldUser: Record<string, any>) =>
 *   TE.of(...) as TE.TaskEither<Error, Result>
 *
 * let runJobs = async (oldUsers: Record<string, any>[]) => {
 *   let jobs = oldUsers.map((it) => () => getStoreJob(it))
 *   await pipe(batchWithDelay(30)(jobs))()
 * }
 */
export declare let batchWithDelay: <E, A>(delay: number) => (tasks: Array<TE.TaskEither<E, A>>) => TE.TaskEither<E, Array<A>>;
