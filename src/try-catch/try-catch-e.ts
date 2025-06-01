// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))

import { e } from "../lib.js"

export let tryCatch =
  <T, A>(f: (param: T) => A) =>
  (param: T) =>
    e.tryCatch(() => f(param), e.toError)
