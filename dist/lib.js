// one possible problem when adding this file: Are all of these exports included in the final bundle?
export * as O from "fp-ts/lib/Option.js";
export * as T from "fp-ts/lib/TaskEither.js";
export * as R from "fp-ts/lib/ReaderTaskEither.js";
export * as E from "fp-ts/lib/Either.js";
export * as A from "fp-ts/lib/Array.js";
export * as B from "fp-ts/lib/boolean.js";
import * as fun from "fp-ts/lib/function.js";
export let pipe = fun.pipe;
export let flow = fun.flow;
import { asksReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
export const asksRte = asksReaderTaskEither;
//# sourceMappingURL=lib.js.map