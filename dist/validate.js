import { string } from "fp-ts";
import { E, pipe } from "./lib.js";
import * as S from "fp-ts/lib/Semigroup.js";
import * as A from "fp-ts/lib/Apply.js";
/**
 * concat all errors into a single string (apS)
 *
 * @example
 * let validateInput = (body: any): E.Either<Error, Input> =>
 *  pipe(
 *    E.Do,
 *    apSc("traces", body.traces ? E.right(body.traces) : E.left("traces is required")),
 *    apSc("config", body.config ? E.right(body.config) : E.left("config is required")),
 *    E.fold(
 *      (err) => E.left(new Error(err)),
 *      (validated) => E.right(validated as Input),
 *    ),
 *  )
 */
export let apS = A.apS(E.getApplicativeValidation(pipe(string.Semigroup, S.intercalate(", "))));
//# sourceMappingURL=validate.js.map