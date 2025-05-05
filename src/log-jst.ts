// with jst-logger
import * as L from "logging-ts/lib/IO.js"
import { T } from "./lib.js"
import { Logger } from "jst-logger"

let withLogger =
  (logger: L.LoggerIO<string>) =>
  <A>(message: (a: A) => string): (<E>(ma: T.TaskEither<E, A>) => T.TaskEither<E, A>) =>
    T.chainFirst((a) => T.fromIO(logger(message(a))))

var debug = function (a: any) {
  return function () {
    return Logger.debug(a)
  }
}
export let lgd = withLogger(debug)

export let elg = (error: any) => {
  try {
    return JSON.parse(error)
  } catch (e) {
    return error
  }
}
