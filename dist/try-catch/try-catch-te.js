import { E, T } from "../lib.js";
export let tryCatch = (f) => (param) => T.tryCatch(() => f(param), E.toError);
//# sourceMappingURL=try-catch-te.js.map