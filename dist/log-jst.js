import { T } from "./lib.js";
import { Logger } from "jst-logger";
let withLogger = (logger) => (message) => T.chainFirst((a) => T.fromIO(logger(message(a))));
var debug = function (a) {
    return function () {
        return Logger.debug(a);
    };
};
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