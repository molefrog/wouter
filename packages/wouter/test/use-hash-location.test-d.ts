import { test, describe, expectTypeOf } from "bun:test";
import { useHashLocation, navigate } from "../src/use-hash-location.js";
import { BaseLocationHook } from "../src/index.js";

const assertType = <T>(_value: T): void => {};

test("is a location hook", () => {
  expectTypeOf(useHashLocation).toMatchTypeOf<BaseLocationHook>();
  expectTypeOf(useHashLocation()).toMatchTypeOf<[string, Function]>();
});

test("accepts a `ssrPath` path option", () => {
  useHashLocation({ ssrPath: "/foo" });
  useHashLocation({ ssrPath: "" });

  // @ts-expect-error
  useHashLocation({ base: 123 });
  // @ts-expect-error
  useHashLocation({ unknown: "/base" });
});

test("exposes its href formatter", () => {
  expectTypeOf(useHashLocation.hrefs("/users")).toEqualTypeOf<string>();

  // @ts-expect-error - hrefs formats string paths
  useHashLocation.hrefs(new URL("https://example.com"));
});

describe("`navigate` function", () => {
  test("accepts an arbitrary `state` option", () => {
    navigate("/object", { state: { foo: "bar" } });
    navigate("/symbol", { state: Symbol("foo") });
    navigate("/string", { state: "foo" });
    navigate("/undef", { state: undefined });
  });

  test("returns nothing", () => {
    assertType<void>(navigate("/foo"));
  });

  test("preserves explicit state types through the hook", () => {
    const [, navigateFromHook] = useHashLocation();
    navigateFromHook<{ count: number }>("/next", {
      state: { count: 1 },
      replace: true,
      transition: true,
    });

    // @ts-expect-error - explicit state shapes are checked
    navigateFromHook<{ count: number }>("/next", { state: "wrong" });
    // @ts-expect-error - hash navigation only accepts string paths
    navigate(new URL("https://example.com"));
  });
});
