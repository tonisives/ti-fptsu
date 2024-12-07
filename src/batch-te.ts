import { pipe } from "fp-ts/lib/function.js"
import * as A from "fp-ts/lib/Array.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import { T } from "./lib.js"

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
export let batchWithLimit =
  <E, A>(limit: number) =>
  (tasks: Array<TE.TaskEither<E, A>>): TE.TaskEither<E, Array<A>> =>
    pipe(
      tasks,
      A.chunksOf(limit),
      A.map(A.sequence(TE.ApplicativePar)),
      A.sequence(TE.ApplicativeSeq),
      TE.map(A.flatten),
    ) as TE.TaskEither<E, Array<A>>

/**
 * Batch an array of tasks with a delay between each task.
 *
 * @example
 * let getJob = async (oldUser: Record<string, any>) =>
 *   TE.of(...) as TE.TaskEither<Error, Result>
 *
 *  let getPipeJob = (startTimes: number[]) =>
 *   pipe(
 *     TE.of(1),
 *     // note we need to call logging inside the TE for the delayed logging
 *     TE.map(() => console.log("starting")),
 *     TE.map((it) => it),
 *   )
 *
 * let runJobs = async (oldUsers: Record<string, any>[]) => {
 *   let jobs = oldUsers.map((it) => () => getStoreJob(it))
 *   await pipe(batchWithDelay(30)(jobs))()
 * }
 *
 */
export let batchWithDelay =
  <E, A>(delay: number) =>
  (tasks: Array<TE.TaskEither<E, A>>): TE.TaskEither<E, Array<A>> =>
    pipe(
      tasks,
      A.mapWithIndex((i, task) => T.delay(delay * i)(task)),
      A.sequence(TE.ApplicativePar),
    ) as TE.TaskEither<E, Array<A>>
