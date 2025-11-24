import { test, describe, expectTypeOf } from "bun:test";
import {
  useBrowserLocation,
  useSearch,
  useHistoryState,
} from "../src/use-browser-location.js";

const assertType = <T,>(_value: T): void => {};

describe("useBrowserLocation", () => {
  test("should return string, function tuple", () => {
    const [loc, navigate] = useBrowserLocation();

    assertType<string>(loc);
    assertType<Function>(navigate);
  });

  test("should return `navigate` function with `path` and `options` parameters", () => {
    const [, navigate] = useBrowserLocation();

    assertType(navigate("/path"));
    assertType(navigate(""));

    // @ts-expect-error
    assertType(navigate());
    // @ts-expect-error
    assertType(navigate(null));

    assertType(navigate("/path", { replace: true }));
    // @ts-expect-error
    assertType(navigate("/path", { unknownOption: true }));
  });

  test("should support `ssrPath` option", () => {
    assertType(useBrowserLocation({ ssrPath: "/something" }));
    // @ts-expect-error
    assertType(useBrowserLocation({ foo: "bar" }));
  });
});

describe("useSearch", () => {
  test("should return string", () => {
    type Search = ReturnType<typeof useSearch>;
    const search = useSearch();

    assertType<string>(search);
    const allowedSearchValues: Search[] = ["", "?leading", "no-?-sign"];
  });
});

describe("useHistoryState", () => {
  test("should support generics", () => {
    type TestCase = { hello: string };
    const state = useHistoryState<TestCase>();

    expectTypeOf(state).toEqualTypeOf<TestCase>();
  });

  test("should fallback to any when type doesn't provided", () => {
    const state = useHistoryState();

    expectTypeOf(state).toEqualTypeOf<any>();
  });
});
