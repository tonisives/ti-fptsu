import * as C from "fp-ts/lib/Console.js"
import * as L from "logging-ts/lib/IO.js"
import * as TE from "fp-ts/lib/TaskEither.js"
import chalk from "chalk"

let withLogger =
  (logger: L.LoggerIO<string>) =>
  <A>(
    message: (a: A) => string
  ): (<E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>) =>
    TE.chainFirst((a) => TE.fromIO(logger(message(a))))

export let log = withLogger(C.info)

type Color = "red" | "green" | "blue" | "yellow" | "magenta" | "cyan"
let getChalk = (color: Color) => chalk[color]

let withLoggerColour =
  (logger: L.LoggerIO<string>, color: Color) =>
  <A>(
    message: (a: A) => string
  ): (<E>(ma: TE.TaskEither<E, A>) => TE.TaskEither<E, A>) =>
    TE.chainFirst((a) => TE.fromIO(logger(getChalk(color)(message(a)))))

/**
 * Log with colour 
 * 
 * @example
 * 
 * await pipe(
 *     TE.Do,
 *     TE.bind("input", () => pipe(validateInput(event), TE.fromEither)),
 *     log(() => "checking conditions"),
 *     lgc("yellow", () => "yellow"),
 *     TE.bind("pre", () => sequenceT(TE.ApplicativePar)(
 *     ...
 * )))
 * 
 */
export let lgc =
  <A, E>(color: Color, f: (a: A) => string) =>
  (ma: TE.TaskEither<E, A>) =>
    withLoggerColour(C.info, color)(f)(ma)
