import { E, TE } from "../lib.js";
export let tryCatch = (f) => (param) => TE.tryCatch(() => f(param), E.toError);
//# sourceMappingURL=try-catch-te.js.map