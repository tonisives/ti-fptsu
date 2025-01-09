// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))

import { E, TE } from "./lib.js"

// export let TE_tryCatch = <E, A>(f: () => Promise<A>) => TE.tryCatch(f, E.toError)

// export let E_tryCatch = <E, A>(f: () => A) => E.tryCatch(f, E.toError)

export let E_tryCatch =
  <T, A>(f: (param: T) => A) =>
  (param: T) =>
    E.tryCatch(() => f(param), E.toError)

export let TE_tryCatch =
  <T, A>(f: (param: T) => Promise<A>) =>
  (param: T) =>
    TE.tryCatch(() => f(param), E.toError)