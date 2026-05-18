import { test, expect } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { memoryLocation } from "../src/memory-location.js";

test("returns a hook that is compatible with location spec", () => {
  const { hook } = memoryLocation();

  const { result } = renderHook(() => hook());
  const [value, update] = result.current;

  expect(typeof value).toBe("string");
  expect(typeof update).toBe("function");
});

test("should support initial path", () => {
  const { hook } = memoryLocation({ path: "/test-case" });

  const { result } = renderHook(() => hook());
  const [value] = result.current;

  expect(value).toBe("/test-case");
});

test("should support initial state", () => {
  const memory = memoryLocation({
    path: "/test-case",
    state: { from: "test" },
  });

  expect(memory.state).toStrictEqual({ from: "test" });
});

test("should support initial path with query", () => {
  const { searchHook } = memoryLocation({ path: "/test-case?foo=bar" });

  const { result } = renderHook(() => searchHook());
  const value = result.current;

  expect(value).toBe("foo=bar");
});

test("should support search path as parameter", () => {
  const { searchHook } = memoryLocation({
    path: "/test-case?foo=bar",
    searchPath: "key=value",
  });

  const { result } = renderHook(() => searchHook());
  const value = result.current;

  expect(value).toBe("foo=bar&key=value");
});

test('should return location hook that has initial path "/" by default', () => {
  const { hook } = memoryLocation();

  const { result } = renderHook(() => hook());
  const [value] = result.current;

  expect(value).toBe("/");
});

test('should return search hook that has initial query "" by default', () => {
  const { searchHook } = memoryLocation();

  const { result } = renderHook(() => searchHook());
  const value = result.current;

  expect(value).toBe("");
});

test("should return standalone `navigate` method", () => {
  const { hook, navigate } = memoryLocation();

  const { result } = renderHook(() => hook());

  act(() => navigate("/standalone"));

  const [value] = result.current;
  expect(value).toBe("/standalone");
});

test("should update state through standalone `navigate`", () => {
  const memory = memoryLocation({
    path: "/test-case",
    state: { from: "test" },
  });

  memory.navigate("/standalone", { state: { from: "navigate" } });

  expect(memory.state).toStrictEqual({ from: "navigate" });
});

test("should preserve state when navigating without `state` option", () => {
  const memory = memoryLocation({
    path: "/test-case",
    state: { from: "test" },
  });

  memory.navigate("/standalone");

  expect(memory.state).toStrictEqual({ from: "test" });
});

test("should return location hook that supports navigation", () => {
  const { hook } = memoryLocation();

  const { result } = renderHook(() => hook());

  act(() => result.current[1]("/location"));

  const [value] = result.current;
  expect(value).toBe("/location");
});

test("should update state through hook navigation", () => {
  const memory = memoryLocation({
    path: "/test-case",
    state: { from: "test" },
  });

  const { result, unmount } = renderHook(() => memory.hook());

  act(() => result.current[1]("/location", { state: { from: "hook" } }));

  expect(memory.state).toStrictEqual({ from: "hook" });
  unmount();
});

test("should record all history when `record` option is provided", () => {
  const {
    hook,
    history,
    navigate: standalone,
  } = memoryLocation({ record: true, path: "/test" });

  const { result } = renderHook(() => hook());

  act(() => standalone("/standalone"));
  act(() => result.current[1]("/location"));

  expect(result.current[0]).toBe("/location");

  expect(history).toStrictEqual(["/test", "/standalone", "/location"]);

  act(() => standalone("/standalone", { replace: true }));

  expect(history).toStrictEqual(["/test", "/standalone", "/standalone"]);

  act(() => result.current[1]("/location", { replace: true }));

  expect(history).toStrictEqual(["/test", "/standalone", "/location"]);
});

test("should not have history when `record` option is falsy", () => {
  // @ts-expect-error
  const { history, reset } = memoryLocation();
  expect(history).not.toBeDefined();
  expect(reset).not.toBeDefined();
});

test("should have reset method when `record` option is provided", () => {
  const { history, reset, navigate } = memoryLocation({
    path: "/initial",
    record: true,
  });
  expect(history).toBeDefined();
  expect(reset).toBeDefined();

  navigate("test-1");
  navigate("test-2");

  reset();

  expect(history).toStrictEqual(["/initial"]);
});

test("should have reset method that reset hook location", () => {
  const { hook, history, navigate, reset } = memoryLocation({
    record: true,
    path: "/test",
  });
  const { result } = renderHook(() => hook());

  act(() => navigate("/location"));

  expect(result.current[0]).toBe("/location");

  expect(history).toStrictEqual(["/test", "/location"]);

  act(() => reset());

  expect(history).toStrictEqual(["/test"]);

  expect(result.current[0]).toBe("/test");
});

test("should reset state to its initial value", () => {
  const memory = memoryLocation({
    record: true,
    path: "/test",
    state: { from: "initial" },
  });

  memory.navigate("/location", { state: { from: "navigate" } });
  expect(memory.state).toStrictEqual({ from: "navigate" });

  memory.reset();

  expect(memory.state).toStrictEqual({ from: "initial" });
});
