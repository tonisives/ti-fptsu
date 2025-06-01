import { e, te } from "../lib.js";
export let tryCatch = (f) => (param) => te.tryCatch(() => f(param), e.toError);
//# sourceMappingURL=try-catch-te.js.map