import { pipe, T } from "./lib.js";
export let toNonReadOnly = (it) => it;
export let getOrThrow = (t) => pipe(t, T.getOrElse((e) => {
    throw e;
}));
//# sourceMappingURL=utils.js.map