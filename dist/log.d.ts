import * as L from "logging-ts/lib/IO.js";
import * as TE from "fp-ts/lib/TaskEither.js";
export declare const withLogger: (logger: L.LoggerIO<string>) => <A>(message: (a: A) => string) => <E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
export declare let log: <A>(message: (a: A) => string) => <E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
