import { tell } from "fp-ts/lib/Writer.js"
import { e, te } from "../lib.js"

export let tryCatch =
  <T, A>(f: (param: T) => Promise<A>) =>
  (param: T) =>
    te.tryCatch(() => f(param), e.toError)
