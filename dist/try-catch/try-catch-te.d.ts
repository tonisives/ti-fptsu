import { te } from "../lib.js";
export declare let tryCatch: <T, A>(f: (param: T) => Promise<A>) => (param: T) => te.TaskEither<Error, A>;
