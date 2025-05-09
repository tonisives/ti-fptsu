export * as O from "fp-ts/lib/Option.js";
export * as T from "fp-ts/lib/TaskEither.js";
export * as R from "fp-ts/lib/ReaderTaskEither.js";
export * as E from "fp-ts/lib/Either.js";
export * as A from "fp-ts/lib/Array.js";
export * as B from "fp-ts/lib/boolean.js";
import * as fun from "fp-ts/lib/function.js";
export declare let pipe: typeof fun.pipe;
export declare let flow: typeof fun.flow;
import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { TaskEither } from "fp-ts/lib/TaskEither.js";
import { Option } from "fp-ts/lib/Option.js";
export declare const asksRte: <R, E, A>(f: (r: R) => ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>;
export type TaskE<E, A> = TaskEither<E, A>;
export type ReaderTE<R, E, A> = ReaderTaskEither<R, E, A>;
export type Opt<A> = Option<A>;
