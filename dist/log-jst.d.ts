import { io, te } from "./lib.js";
export declare let llIO: (msgFn: () => string, logFn: (logMsgFn: () => string) => void) => () => io.IO<void>;
export declare let lgd: <A>(message: (a: A) => string) => (<E>(ma: te.TaskEither<E, A>) => te.TaskEither<E, A>);
export declare let elg: (error: any) => any;
