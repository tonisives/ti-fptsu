// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))
import { E, TE } from "./lib.js";
export let tryCatchTE = (f) => TE.tryCatch(f, E.toError);
export let tryCatchE = (f) => E.tryCatch(f, E.toError);
export let tryCatchEP = (f) => (param) => E.tryCatch(() => f(param), E.toError);
export let tryCatchTEP = (f) => (param) => TE.tryCatch(() => f(param), E.toError);
//# sourceMappingURL=try-catch.js.map