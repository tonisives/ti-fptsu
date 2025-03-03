import { Errors } from "io-ts";
/**
pipe(
  data, // string
  ResponseCodec.decode,
  E.mapLeft(joinSchemaErrors),
  ...
)
 
 */
export declare let joinFieldNames: (errors: Errors) => string;
export declare let simpleJoin: (errors: Errors) => string;
