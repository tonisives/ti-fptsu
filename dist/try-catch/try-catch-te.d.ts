import { TE } from "../lib.js";
export declare let tryCatch: <T, A>(f: (param: T) => Promise<A>) => (param: T) => TE.TaskEither<Error, A>;
