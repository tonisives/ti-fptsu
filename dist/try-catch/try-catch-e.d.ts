import { e } from "../lib.js";
export declare let tryCatch: <T, A>(f: (param: T) => A) => (param: T) => e.Either<Error, A>;
