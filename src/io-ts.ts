import { Errors } from "io-ts"
import { E } from "./lib.js"
import { PathReporter } from "io-ts/lib/PathReporter.js"

/**
pipe(
  data,
  ResponseCodec.decode,
  E.mapLeft(joinSchemaErrors),
  ...
)
 
 */
export let joinSchemaErrors = (errors: Errors): string => {
  const uniqueErrors = new Set(
    PathReporter.report(E.left(errors)).map((error) => {
      if (error.match(/Invalid value/)) {
        const fieldMatch = error.match(/\/([^/]+):/)
        if (fieldMatch) {
          const fieldName = fieldMatch[1]
          return `${fieldName}`
        }
      }
      return error
    }),
  )

  return "Invalid or missing fields: " + Array.from(uniqueErrors).join(", ")
}
