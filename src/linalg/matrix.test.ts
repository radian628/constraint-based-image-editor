import test from "ava";
import { matMul } from "./matrix.js";

test("multiply two identity matrices", (t) => {
  t.deepEqual(matMul([1, 0, 0, 1], 2, [1, 0, 0, 1], 2), [1, 0, 0, 1]);
});
test("(1 2 3 4) (5 6 7 8)", (t) => {
  t.deepEqual(matMul([1, 2, 3, 4], 2, [5, 6, 7, 8], 2), [19, 22, 43, 50]);
});

test("(1 2 3 4 5 6 7 8 9) (10 11 12 13 14 15 16 17 18)", (t) => {
  t.deepEqual(
    matMul(
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      3,
      [10, 11, 12, 13, 14, 15, 16, 17, 18],
      3
    ),
    [84, 90, 96, 201, 216, 231, 318, 342, 366]
  );
});
