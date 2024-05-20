import { pipe } from "fp-ts/lib/function.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { logC } from "./log.js";
import { it } from "vitest";
it("should log", async () => {
    await pipe(TE.of(0), logC("green")((it) => `The number is ${it}`))();
});
//# sourceMappingURL=log.test.js.map