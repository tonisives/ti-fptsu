// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))

import { E, TE } from "./lib.js"

export let tryCatchTE = <E, A>(f: () => Promise<A>) => TE.tryCatch(f, E.toError)

export let tryCatchE = <E, A>(f: () => A) => E.tryCatch(f, E.toError)

export let tryCatchEP =
  <T, A>(f: (param: T) => A) =>
  (param: T) =>
    E.tryCatch(() => f(param), E.toError)

export let tryCatchTEP =
  <T, A>(f: (param: T) => Promise<A>) =>
  (param: T) =>
    TE.tryCatch(() => f(param), E.toError)
