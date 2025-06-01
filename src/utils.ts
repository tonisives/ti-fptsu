import { pipe, te, TaskE } from "./lib.js"

export let toNonReadOnly = <T>(it: readonly T[]): T[] => it as T[]

export let getOrThrow = <T, E>(t: TaskE<E, T>): (() => Promise<T>) =>
  pipe(
    t,
    te.getOrElse((e) => {
      throw e
    }),
  )
