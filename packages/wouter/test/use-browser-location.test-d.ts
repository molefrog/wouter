import { it, assertType, describe, expectTypeOf } from "vitest";
import {
  useBrowserLocation,
  useSearch,
  useHistoryState,
} from "wouter/use-browser-location";

describe("useBrowserLocation", () => {
  it("should return string, function tuple", () => {
    const [loc, navigate] = useBrowserLocation();

    assertType<string>(loc);
    assertType<Function>(navigate);
  });

  it("should return `navigate` function with `path` and `options` parameters", () => {
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

  it("should support `ssrPath` option", () => {
    assertType(useBrowserLocation({ ssrPath: "/something" }));
    // @ts-expect-error
    assertType(useBrowserLocation({ foo: "bar" }));
  });
});

describe("useSearch", () => {
  it("should return string", () => {
    const search = useSearch();

    assertType<string>(search);
  });
});

describe("useHistoryState", () => {
  it("should support generics", () => {
    type TestCase = { hello: string };
    const state = useHistoryState<TestCase>();

    expectTypeOf(state).toEqualTypeOf<TestCase>();
  });

  it("should fallback to any when type doesn't provided", () => {
    const state = useHistoryState();

    expectTypeOf(state).toEqualTypeOf<any>();
  });
});
