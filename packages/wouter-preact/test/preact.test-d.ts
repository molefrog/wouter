import { test } from "bun:test";
import { useRoute } from "../src/index.js";

const assertType = <T,>(_value: T): void => {};

test("should only accept strings", () => {
  // @ts-expect-error
  assertType(useRoute(Symbol()));
  // @ts-expect-error
  assertType(useRoute());
  assertType(useRoute("/"));
});
