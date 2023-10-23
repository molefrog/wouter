import { it, assertType, describe, expectTypeOf } from "vitest";
import { useHashLocation, navigate } from "wouter/use-hash-location";
import { BaseLocationHook } from "wouter";

it("is a location hook", () => {
  expectTypeOf(useHashLocation).toMatchTypeOf<BaseLocationHook>();
  expectTypeOf(useHashLocation()).toMatchTypeOf<[string, Function]>();
});

it("accepts a `ssrPath` path option", () => {
  useHashLocation({ ssrPath: "/foo" });
  useHashLocation({ ssrPath: "" });

  // @ts-expect-error
  useHashLocation({ base: 123 });
  // @ts-expect-error
  useHashLocation({ unknown: "/base" });
});

describe("`navigate` function", () => {
  it("accepts an arbitrary `state` option", () => {
    navigate("/object", { state: { foo: "bar" } });
    navigate("/symbol", { state: Symbol("foo") });
    navigate("/string", { state: "foo" });
    navigate("/undef", { state: undefined });
  });

  it("returns nothing", () => {
    assertType<void>(navigate("/foo"));
  });
});
