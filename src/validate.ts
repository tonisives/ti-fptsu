import { string } from "fp-ts"
import { e, pipe } from "./lib.js"
import * as S from "fp-ts/lib/Semigroup.js"
import * as A from "fp-ts/lib/Apply.js"

/**
 * concat all errors into a single string (apS)
 *
 * @example
 * let validateInput = (body: any): E.Either<Error, Input> =>
 *  pipe(
 *    E.Do,
 *    apS("traces", body.traces ? E.right(body.traces) : E.left("traces is required")),
 *    apS("config", E.fromNullable("Missing type parameter")(body.config)),
 *    E.fold(
 *      (err) => E.left(new Error(err)),
 *      (validated) => E.right(validated as Input),
 *    ),
 *  )
 */
export let apS = A.apS(e.getApplicativeValidation(pipe(string.Semigroup, S.intercalate(", "))))
