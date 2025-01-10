import { E } from "../lib.js";
export declare let tryCatch: <T, A>(f: (param: T) => A) => (param: T) => E.Either<Error, A>;
