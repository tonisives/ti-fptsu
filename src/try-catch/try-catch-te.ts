import { E, TE } from "../lib.js"

export let tryCatch =
  <T, A>(f: (param: T) => Promise<A>) =>
  (param: T) =>
    TE.tryCatch(() => f(param), E.toError)
