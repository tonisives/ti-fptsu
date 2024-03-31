import * as T from "fp-ts/lib/Task.js";
export declare let batchWithLimit: <A>(limit: number) => (tasks: Array<T.Task<A>>) => T.Task<Array<A>>;
export declare let batchWithDelay: <A>(delay: number) => (tasks: Array<T.Task<A>>) => T.Task<Array<A>>;
