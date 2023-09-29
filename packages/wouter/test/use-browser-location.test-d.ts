import { it, assertType } from "vitest";
import { useBrowserLocation } from "wouter/use-browser-location";

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

it("should support base option", () => {
  assertType(useBrowserLocation({ base: "/something" }));
  // @ts-expect-error
  assertType(useBrowserLocation({ foo: "bar" }));
});
