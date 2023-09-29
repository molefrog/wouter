import { it, assertType } from "vitest";
import { useBrowserLocation } from "wouter/use-browser-location";

it("should return string, function tuple", () => {
  const [loc, navigate] = useBrowserLocation();

  assertType<string>(loc);
  assertType<Function>(navigate);
});

it("should support options", () => {
  assertType(useBrowserLocation({ base: "/something" }));
  // @ts-expect-error
  assertType(useBrowserLocation({ foo: "bar" }));
});
