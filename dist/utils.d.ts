import { TaskE } from "./lib.js";
export declare let toNonReadOnly: <T>(it: readonly T[]) => T[];
export declare let getOrThrow: <T, E>(t: TaskE<E, T>) => (() => Promise<T>);
