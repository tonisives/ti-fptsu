// one possible problem when adding this file: Are all of these exports included in the final bundle?

export * as O from "fp-ts/lib/Option.js"
export * as TE from "fp-ts/lib/TaskEither.js"
export * as RTE from "fp-ts/lib/ReaderTaskEither.js"
export * as E from "fp-ts/lib/Either.js"
export * as T from "fp-ts/lib/Task.js"
export * as A from "fp-ts/lib/Array.js"

import * as fun from "fp-ts/lib/function.js"
export let pipe = fun.pipe
export let flow = fun.flow

import { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js"
import { TaskEither } from "fp-ts/lib/TaskEither.js"

export type TaskE<E, A> = TaskEither<E, A>
export type ReaderTE<R, E, A> = ReaderTaskEither<R, E, A>
