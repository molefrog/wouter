import { test, expectTypeOf } from "bun:test";
import { memoryLocation } from "../src/memory-location.js";
import { BaseLocationHook } from "../src/index.js";

const assertType = <T,>(_value: T): void => {};

test("should return hook that supports location spec", () => {
  const { hook } = memoryLocation();

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();

  const [location, navigate] = hook();

  assertType<string>(location);
  assertType<Function>(navigate);
});

test("should return `navigate` method for navigating outside of components", () => {
  const { navigate } = memoryLocation();

  assertType<Function>(navigate);
});

test("should support `record` option for saving the navigation history", () => {
  const { history, reset } = memoryLocation({ record: true });

  assertType<string[]>(history);
  assertType<Function>(reset);
});

test("should have history only wheen record is true", () => {
  // @ts-expect-error
  const { history, reset } = memoryLocation({ record: false });
  assertType(history);
  assertType(reset);
});

test("should support initial path", () => {
  const { hook } = memoryLocation({ path: "/initial-path" });

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();
});

test("should support `static` option", () => {
  const { hook } = memoryLocation({ static: true });

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();
});
