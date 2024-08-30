import { E } from "./lib.js";
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
export declare let commaValidate: <N extends string, A, B>(name: Exclude<N, keyof A>, fb: E.Either<string, B>) => (fa: E.Either<string, A>) => E.Either<string, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B; }>;
