import * as C from "fp-ts/lib/Console.js"
import * as L from "logging-ts/lib/IO.js"
import * as TE from "fp-ts/lib/TaskEither.js"


export const withLogger =
  (logger: L.LoggerIO<string>) =>
  <A>(
    message: (a: A) => string
  ): (<E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>) =>
    TE.chainFirst((a) => TE.fromIO(logger(message(a))))

export let log = withLogger(C.info)
