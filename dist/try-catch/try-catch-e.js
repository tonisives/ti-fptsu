// TE.tryCatch(() => dbClient.send(command), E.toError)
// >
// tryCatchE(dbClient.send(command))
import { e } from "../lib.js";
export let tryCatch = (f) => (param) => e.tryCatch(() => f(param), e.toError);
//# sourceMappingURL=try-catch-e.js.map