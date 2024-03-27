import * as C from "fp-ts/lib/Console.js";
import * as TE from "fp-ts/lib/TaskEither.js";
export const withLogger = (logger) => (message) => TE.chainFirst((a) => TE.fromIO(logger(message(a))));
export let log = withLogger(C.info);
//# sourceMappingURL=log.js.map