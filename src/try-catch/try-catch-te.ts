import { E, T } from "../lib.js"

export let tryCatch =
  <T, A>(f: (param: T) => Promise<A>) =>
  (param: T) =>
    T.tryCatch(() => f(param), E.toError)
