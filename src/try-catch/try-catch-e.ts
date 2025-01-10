// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))

import { E } from "../lib.js"

export let tryCatch =
  <T, A>(f: (param: T) => A) =>
  (param: T) =>
    E.tryCatch(() => f(param), E.toError)
