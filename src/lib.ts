// one possible problem when adding this file: Are all of these exports included in the final bundle?

export * as O from "fp-ts/lib/Option.js"
export * as T from "fp-ts/lib/TaskEither.js"
export * as R from "fp-ts/lib/ReaderTaskEither.js"
export * as E from "fp-ts/lib/Either.js"
export * as A from "fp-ts/lib/Array.js"

import * as fun from "fp-ts/lib/function.js"
export let pipe = fun.pipe
export let flow = fun.flow

import { asksReaderTaskEither, ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js"
import { TaskEither } from "fp-ts/lib/TaskEither.js"

export const asksRte = asksReaderTaskEither

export type Tt<E, A> = TaskEither<E, A>
export type Rt<R, E, A> = ReaderTaskEither<R, E, A>
