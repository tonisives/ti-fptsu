import * as C from "fp-ts/lib/Console.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import chalk from "chalk";
let withLogger = (logger) => (message) => TE.chainFirst((a) => TE.fromIO(logger(message(a))));
export let log = withLogger(C.info);
let getChalk = (color) => chalk[color];
let withLoggerColour = (logger, color) => (message) => TE.chainFirst((a) => TE.fromIO(logger(getChalk(color)(message(a)))));
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
export let lgc = (color, f) => (ma) => withLoggerColour(C.info, color)(f)(ma);
/**
 *
 * Logs a yellow log between TE functions
 *
 * @param progress optional callback about the progress. run automatically
 */
export let lgy = (message, progress) => (ma) => {
    progress?.();
    if (typeof message === "function") {
        return lgc("yellow", message)(ma);
    }
    else {
        return lgc("yellow", () => message)(ma);
    }
};
/**
 * Logs a yellow log in the first pipe function call.
 *
 * Call this as the first function in a pipe to log that flow is starting.
 */
export let lgyf = (message, progress) => {
    progress?.();
    if (typeof message === "function") {
        console.log(chalk.yellow(message()));
    }
    else {
        console.log(chalk.yellow(message));
    }
};
//# sourceMappingURL=log.js.map