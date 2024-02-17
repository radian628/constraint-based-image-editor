import { Fn, Type, TypeErrorReason } from "./type-system.js";

function getAssignabilityErrors(
  expected: Type,
  actual?: Type
): TypeErrorReason[] {
  if (!actual) return [{ type: "does-not-exist", expected }];

  const simpleMismatch = () =>
    [{ type: "mismatch", expected, actual }] as TypeErrorReason[];

  switch (expected.type) {
    // primitives: type must match exactly
    case "int":
    case "float":
    case "string":
    case "bool":
      return expected.type == actual.type ? [] : simpleMismatch();

    case "sum":

    /*
    Return types: 
      actual function return type must be assignable to the expected. 
    Arguments:
      actual function arguments must be assignable to expected
    */
    case "fn":
      if (actual.type !== "fn") return simpleMismatch();

      const actualKwArgMap = new Map(
        actual.kwArgs.map((arg) => [arg.name, arg])
      );

      return [
        ...getAssignabilityErrors(expected.return, actual.return).map(
          (mismatch) =>
            ({
              type: "return-type-mismatch",
              fn: expected,
              mismatch: [mismatch],
            } as TypeErrorReason)
        ),
        ...expected.args
          .map(
            (arg, i) =>
              [
                getAssignabilityErrors(arg.type, actual[i]),
                arg.name,
                i,
              ] as const
          )
          .map(
            ([mismatch, name, index]) =>
              ({
                type: "arg-type-mismatch",
                fn: expected,
                mismatch,
                name,
                index,
              } as TypeErrorReason)
          ),
        ...expected.kwArgs
          .map((arg, i) => [
            getAssignabilityErrors(
              arg.type,
              actualKwArgMap.get(arg.name)?.type
            ),
            arg.name,
          ])
          .map(
            ([mismatch, name]) =>
              ({
                type: "arg-type-mismatch",
                fn: expected,
                mismatch,
                name,
              } as TypeErrorReason)
          ),
      ];
  }
}

export function typecheckFunctionCall(fn: Fn, args: Type[]) {}
