import { pipe, te } from "./lib.js";
export let toNonReadOnly = (it) => it;
export let getOrThrow = (t) => pipe(t, te.getOrElse((e) => {
    throw e;
}));
//# sourceMappingURL=utils.js.map