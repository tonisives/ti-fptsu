// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))
import { E } from "../lib.js";
export let tryCatch = (f) => (param) => E.tryCatch(() => f(param), E.toError);
//# sourceMappingURL=try-catch-e.js.map