// with jst-logger
import * as L from "logging-ts/lib/IO.js"
import { te } from "./lib.js"
import { Logger } from "jst-logger"

let withLogger =
  (logger: L.LoggerIO<string>) =>
  <A>(message: (a: A) => string): (<E>(ma: te.TaskEither<E, A>) => te.TaskEither<E, A>) =>
    te.chainFirst((a) => te.fromIO(logger(message(a))))

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
