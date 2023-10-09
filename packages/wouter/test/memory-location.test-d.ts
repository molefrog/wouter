import { it, assertType, expectTypeOf } from "vitest";
import { memoryLocation } from "wouter/memory-location";

it("should return hook that supports location spec", () => {
  const { hook } = memoryLocation();

  assertType<Function>(hook);

  const [location, navigate] = hook();

  assertType<string>(location);
  assertType<Function>(navigate);
});

it("should return `navigate` method for navigating outside of components", () => {
  const { navigate } = memoryLocation();

  assertType<Function>(navigate);
});

it("should support `record` option for saving the navigation history", () => {
  const { history } = memoryLocation({ record: true });

  assertType<string[]>(history);
});

it("should support initial path", () => {
  const { hook } = memoryLocation({ path: "/initial-path" });

  assertType<Function>(hook);
});

it("should support `static` option", () => {
  const { hook } = memoryLocation({ static: true });

  assertType<Function>(hook);
});

it("should support `static` option", () => {
  const { hook } = memoryLocation({ static: true });

  assertType<Function>(hook);
});
