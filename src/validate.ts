import { string } from "fp-ts"
import { E, pipe } from "./lib.js"
import * as S from "fp-ts/lib/Semigroup.js"
import * as A from "fp-ts/lib/Apply.js"

/**
 pipe(
  E.Do,
  apS("jwt", validateJwt(event)),
  apS("user", validateUser(event)),
  E.fold(
    (err) => E.left(new Error(err)),
    (validated) => E.right(validated)
  )
 )
 */
export let commaValidate = A.apS(
  E.getApplicativeValidation(pipe(string.Semigroup, S.intercalate(", "))),
)
