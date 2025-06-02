// one possible problem when adding this file: Are all of these exports included in the final bundle?

export * as o from "fp-ts/lib/Option.js"
export * as e from "fp-ts/lib/Either.js"

export * as te from "fp-ts/lib/TaskEither.js"
export * as t from "fp-ts/lib/Task.js"
export * as rte from "fp-ts/lib/ReaderTaskEither.js"

export * as a from "fp-ts/lib/Array.js"
export * as nea from "fp-ts/lib/NonEmptyArray.js"
export * as b from "fp-ts/lib/boolean.js"

import * as fun from "fp-ts/lib/function.js"

export let pipe = fun.pipe
export let flow = fun.flow

import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js"
import { TaskEither } from "fp-ts/lib/TaskEither.js"
import { Option } from "fp-ts/lib/Option.js"

export type TaskE<E, A> = TaskEither<E, A>
export type ReaderTE<R, E, A> = ReaderTaskEither<R, E, A>
export type Opt<A> = Option<A>
