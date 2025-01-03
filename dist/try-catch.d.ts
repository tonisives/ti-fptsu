import { E, TE } from "./lib.js";
export declare let tryCatchTE: <E, A>(f: () => Promise<A>) => TE.TaskEither<Error, A>;
export declare let tryCatchE: <E, A>(f: () => A) => E.Either<Error, A>;
export declare let tryCatchEP: <T, A>(f: (param: T) => A) => (param: T) => E.Either<Error, A>;
export declare let tryCatchTEP: <T, A>(f: (param: T) => Promise<A>) => (param: T) => TE.TaskEither<Error, A>;
