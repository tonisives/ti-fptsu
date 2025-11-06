import { io, pipe, te } from "./lib.js";
import { Logger } from "jst-logger";
let withLogger = (logger) => (message) => te.chainFirst((a) => te.fromIO(logger(message(a))));
var debug = function (a) {
    return function () {
        return Logger.debug(a);
    };
};
export let llIO = (msgFn, logFn) => () => pipe(msgFn, logFn, io.of);
export let lgd = withLogger(debug);
export let elg = (error) => {
    try {
        return JSON.parse(error);
    }
    catch (e) {
        return error;
    }
};
//# sourceMappingURL=log-jst.js.map