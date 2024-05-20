import * as TE from "fp-ts/lib/TaskEither.js";
export declare let log: <A>(message: (a: A) => string) => <E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
type Color = "red" | "green" | "blue" | "yellow" | "magenta" | "cyan";
export declare let logC: (color: Color) => <A>(message: (a: A) => string) => <E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
export {};
