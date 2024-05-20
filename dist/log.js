import * as C from "fp-ts/lib/Console.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import chalk from "chalk";
let withLogger = (logger) => (message) => TE.chainFirst((a) => TE.fromIO(logger(message(a))));
export let log = withLogger(C.info);
let getChalk = (color) => chalk[color];
let withLoggerColour = (logger, color) => (message) => TE.chainFirst((a) => TE.fromIO(logger(getChalk(color)(message(a)))));
export let logC = (color) => withLoggerColour(C.info, color);
//# sourceMappingURL=log.js.map