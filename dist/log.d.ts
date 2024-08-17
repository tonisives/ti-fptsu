import * as TE from "fp-ts/lib/TaskEither.js";
export declare let log: <A>(message: (a: A) => string) => <E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
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
export {};
