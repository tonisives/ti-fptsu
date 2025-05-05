import { T } from "./lib.js";
export declare let lgd: <A>(message: (a: A) => string) => (<E>(ma: T.TaskEither<E, A>) => T.TaskEither<E, A>);
export declare let elg: (error: any) => any;
