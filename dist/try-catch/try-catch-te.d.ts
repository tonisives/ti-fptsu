import { T } from "../lib.js";
export declare let tryCatch: <T, A>(f: (param: T) => Promise<A>) => (param: T) => T.TaskEither<Error, A>;
