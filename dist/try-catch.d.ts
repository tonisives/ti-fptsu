import { E, TE } from "./lib.js";
export declare let E_tryCatch: <T, A>(f: (param: T) => A) => (param: T) => E.Either<Error, A>;
export declare let TE_tryCatch: <T, A>(f: (param: T) => Promise<A>) => (param: T) => TE.TaskEither<Error, A>;
