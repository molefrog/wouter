import { test, expectTypeOf } from "bun:test";
import { memoryLocation } from "../src/memory-location.js";
import { BaseLocationHook, useLocation } from "../src/index.js";

const assertType = <T>(_value: T): void => {};

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

test("should have history only when record is true", () => {
  // @ts-expect-error
  const { history, reset } = memoryLocation({ record: false });
  assertType(history);
  assertType(reset);
});

test("should support initial path", () => {
  const { hook } = memoryLocation({ path: "/initial-path" });

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();
});

test("should support state", () => {
  const memory = memoryLocation({
    path: "/initial-path",
    state: { from: "test" },
  });

  expectTypeOf(memory.state).toEqualTypeOf<{ from: string } | null>();
});

test("should preserve inferred state in both navigation functions", () => {
  const memory = memoryLocation({ state: { from: "initial" } });
  const [, navigate] = memory.hook();

  expectTypeOf(navigate).toEqualTypeOf(memory.navigate);
  navigate("/next", { state: { from: "previous" }, transition: true });
  memory.navigate("/next", { state: { from: "previous" }, replace: true });

  // @ts-expect-error - the hook must preserve the inferred state shape
  navigate("/next", { state: { missing: "from" } });
  // @ts-expect-error - external navigation uses the same state shape
  memory.navigate("/next", { state: 42 });
  // @ts-expect-error - state is read-only
  memory.state = { from: "next" };
});

test("should preserve explicit state through useLocation", () => {
  const memory = memoryLocation<{ count: number }>({ record: true });
  const [, navigate] = useLocation<typeof memory.hook>();

  expectTypeOf(memory.state).toEqualTypeOf<{ count: number } | null>();
  navigate("/next", { state: { count: 1 } });
  memory.navigate("/next", { state: { count: 2 } });
  memory.reset();

  // @ts-expect-error - explicitly typed state survives the public hook
  navigate("/next", { state: { count: "wrong" } });
});

test("should expose the search hook attached to the location hook", () => {
  const memory = memoryLocation({ searchPath: "tab=1" });

  expectTypeOf(memory.hook.searchHook).toEqualTypeOf(memory.searchHook);
  expectTypeOf(memory.hook.searchHook()).toEqualTypeOf<string>();

  // @ts-expect-error - attached searchHook is a function
  const search: string = memory.hook.searchHook;
});

test("should allow dynamic recording without guaranteeing history", () => {
  const record: boolean = Math.random() > 0.5;
  const memory = memoryLocation({ record, state: { count: 0 } });

  expectTypeOf(memory.history).toEqualTypeOf<string[] | undefined>();
  expectTypeOf(memory.reset).toEqualTypeOf<(() => void) | undefined>();
  memory.reset?.();
  memory.hook()[1]("/next", { state: { count: 1 } });

  // @ts-expect-error - recording may be disabled
  memory.reset();
  // @ts-expect-error - recording may be disabled
  const history: string[] = memory.history;
  // @ts-expect-error - dynamic recording must not erase the state type
  memory.hook()[1]("/next", { state: "wrong" });
});

test("should accept optional recording configuration", () => {
  const options: { record?: boolean } = {};
  const memory = memoryLocation<{ count: number }>(options);

  expectTypeOf(memory.history).toEqualTypeOf<string[] | undefined>();
  memory.navigate("/next", { state: { count: 1 } });

  // @ts-expect-error - record only accepts a boolean
  memoryLocation({ record: "yes" });
});

test("should support `static` option", () => {
  const { hook } = memoryLocation({ static: true });

  expectTypeOf(hook).toMatchTypeOf<BaseLocationHook>();
});
