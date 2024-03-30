import * as T from "fp-ts/lib/Task.js";
export declare let batchTasks: <A>(limit: number) => (tasks: Array<T.Task<A>>) => T.Task<Array<A>>;
