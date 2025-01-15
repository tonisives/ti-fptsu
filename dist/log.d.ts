import * as TE from "fp-ts/lib/TaskEither.js";
export declare let log: <A>(message: (a: A) => string) => (<E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>);
type Color = "red" | "green" | "blue" | "yellow" | "magenta" | "cyan";
/**
 * Log with colour
 *
 * @example
 *
 * await pipe(
 *     TE.Do,
 *     TE.bind("input", () => pipe(validateInput(event), TE.fromEither)),
 *     log(() => "checking conditions"),
 *     lgc("yellow", () => "yellow"),
 *     TE.bind("pre", () => sequenceT(TE.ApplicativePar)(
 *     ...
 * )))
 *
 */
export declare let lgc: <A, E>(color: Color, f: (a: A) => string) => (ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
/**
 *
 * Logs a yellow log between TE functions
 *
 * @param progress optional callback about the progress. run automatically
 */
export declare let lgy: <A, E>(message: string | ((a: A) => string), progress?: () => void) => (ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
/**
 * Logs a green log between TE functions
 *
 * @param progress optional callback about the progress. run automatically
 */
export declare let lgg: <A, E>(message: string | ((a: A) => string), progress?: () => void) => (ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
/**
 * Logs a yellow log in the first pipe function call.
 *
 * Call this as the first function in a pipe to log that flow is starting.
 */
export declare let lgyf: (message: string | (() => string), progress?: () => void) => void;
/**
 * Logs a green log in the first pipe function call.
 *
 * Call this as the first function in a pipe to log that flow is starting.
 */
export declare let lggf: (message: string | (() => string), progress?: () => void) => void;
export {};
