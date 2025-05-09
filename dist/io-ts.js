import { E } from "./lib.js";
import { PathReporter } from "io-ts/lib/PathReporter.js";
/**
pipe(
  data, // string
  ResponseCodec.decode,
  E.mapLeft(joinSchemaErrors),
  ...
)
 
 */
export let joinFieldNames = (errors) => {
    const uniqueErrors = new Set(PathReporter.report(E.left(errors)).map((error) => {
        if (error.match(/Invalid value/)) {
            const fieldMatch = error.match(/\/([^/]+):/);
            if (fieldMatch) {
                const fieldName = fieldMatch[1];
                return `${fieldName}`;
            }
        }
        return error;
    }));
    return "Invalid or missing fields: " + Array.from(uniqueErrors).join(", ");
};
export let simpleJoin = (errors) => {
    return Array.from(new Set(errors)).join(", ");
};
//# sourceMappingURL=io-ts.js.map