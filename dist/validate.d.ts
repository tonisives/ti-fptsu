import { E } from "./lib.js";
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
export declare let apS: <N extends string, A, B>(name: Exclude<N, keyof A>, fb: E.Either<string, B>) => (fa: E.Either<string, A>) => E.Either<string, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B; }>;
