import test, { ExecutionContext } from "ava";
import { parseExpr } from "./parse.js";
import { defaultBindingPower } from "./ast.js";

export const roundtrip = test.macro({
  exec(t, str: string, expectStr?: string) {
    const tree = parseExpr(str);
    const stringified = tree.stringify(defaultBindingPower);
    if (!t.is(expectStr ?? str, stringified)) {
      t.log("AST: ", tree.stringify(defaultBindingPower));
      t.log("Stringified: ", stringified);
    }
  },
  title(providedTitle = "", str, expectStr) {
    return (
      `Roundtrip Parse '${str}'` +
      (expectStr ? ` expecting '${expectStr}'` : "")
    );
  },
});
