import { it, assertType, expectTypeOf } from "vitest";
import { memoryLocation } from "wouter/memory-location";
import { BaseLocationHook } from "wouter/use-browser-location";

it("should return hook that supports location spec", () => {
  const { hook } = memoryLocation();

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();

  const [location, navigate] = hook();

  assertType<string>(location);
  assertType<Function>(navigate);
});

it("should return `navigate` method for navigating outside of components", () => {
  const { navigate } = memoryLocation();

  assertType<Function>(navigate);
});

it("should support `record` option for saving the navigation history", () => {
  const { history, reset } = memoryLocation({ record: true });

  assertType<string[]>(history);
  assertType<Function>(reset);
});

it("should have history only wheen record is true", () => {
  // @ts-expect-error
  const { history, reset } = memoryLocation({ record: false });
  assertType(history);
  assertType(reset);
});

it("should support initial path", () => {
  const { hook } = memoryLocation({ path: "/initial-path" });

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();
});

it("should support `static` option", () => {
  const { hook } = memoryLocation({ static: true });

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();
});
