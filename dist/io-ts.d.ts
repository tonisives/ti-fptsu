import { Errors } from "io-ts";
/**
pipe(
  data,
  ResponseCodec.decode,
  E.mapLeft(joinSchemaErrors),
  ...
)
 
 */
export declare let joinSchemaErrors: (errors: Errors) => string;
