import { test, describe, expectTypeOf } from "bun:test";
import {
  useBrowserLocation,
  useSearch,
  useHistoryState,
  useLocationProperty,
} from "../src/use-browser-location.js";

const assertType = <T>(_value: T): void => {};

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
    assertType(navigate(new URL("https://example.com/next")));
    navigate<{ count: number }>("/path", {
      state: { count: 1 },
      transition: true,
    });
    // @ts-expect-error - explicit state shapes are checked
    navigate<{ count: number }>("/path", { state: { count: "wrong" } });
    // @ts-expect-error
    assertType(navigate("/path", { unknownOption: true }));
  });

  test("should support `ssrPath` option", () => {
    assertType(useBrowserLocation({ ssrPath: "/something" }));
    // @ts-expect-error
    assertType(useBrowserLocation({ foo: "bar" }));
  });
});

describe("useLocationProperty", () => {
  test("should preserve object and nullable snapshot types", () => {
    const snapshot = { from: "/previous", scroll: [0, 100] as const };
    const state = useLocationProperty(() => snapshot);

    expectTypeOf(state).toEqualTypeOf<typeof snapshot>();

    const nullable = useLocationProperty<typeof snapshot | null>(
      () => snapshot,
      () => null
    );
    expectTypeOf(nullable).toEqualTypeOf<typeof snapshot | null>();

    useLocationProperty<typeof snapshot>(
      () => snapshot,
      // @ts-expect-error - the server snapshot must match the chosen type
      () => "wrong"
    );
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
