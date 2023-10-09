import { it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { memoryLocation } from "wouter/memory-location";

it("returns a hook that is compatible with location spec", () => {
  const { hook } = memoryLocation();

  const { result, unmount } = renderHook(() => hook());
  const [value, update] = result.current;

  expect(typeof value).toBe("string");
  expect(typeof update).toBe("function");
  unmount();
});

it("should support initial path", () => {
  const { hook } = memoryLocation({ path: "/test-case" });

  const { result, unmount } = renderHook(() => hook());
  const [value] = result.current;

  expect(value).toBe("/test-case");
  unmount();
});

it('should return location hook that has initial path "/" by default', () => {
  const { hook } = memoryLocation();

  const { result, unmount } = renderHook(() => hook());
  const [value] = result.current;

  expect(value).toBe("/");
  unmount();
});

it("should return location hook that supports `base` option for nested routing", () => {
  const { hook } = memoryLocation({ path: "/nested/test" });

  const { result, unmount } = renderHook(() => hook({ base: "/nested" }));
  const [value] = result.current;

  expect(value).toBe("/test");
  unmount();
});

it("should return standalone `navigate` method", () => {
  const { hook, navigate } = memoryLocation();

  const { result, unmount } = renderHook(() => hook());

  act(() => navigate("/standalone"));

  const [value] = result.current;
  expect(value).toBe("/standalone");
  unmount();
});
