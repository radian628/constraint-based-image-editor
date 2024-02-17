import test from "ava";
import { roundtrip } from "./parse-test-utils.js";

test(roundtrip, "123");
test(roundtrip, "123.456");
test(roundtrip, "1 + 2");
test(roundtrip, "1 + 2 - 3");
test(roundtrip, "1 + 2 * 3");
test(roundtrip, "(1 + 2) * 3");
test(roundtrip, "1 == 3");
test(roundtrip, "true && false || true");
test(roundtrip, "{1, 2, 3, 4}");
test(roundtrip, "{x = 3, y = 4, z = 5}");
test(roundtrip, "true || false");
test(roundtrip, "{pos = {1, 2, 3}, dir = {0, 1, 0}}");
test(roundtrip, "sin(45)");
test(roundtrip, "math.sin(45)");
test(roundtrip, "a.b");
test(roundtrip, "a.b.c");
test(roundtrip, "foo.bar + 3 * b.(2)");

/*

*/
