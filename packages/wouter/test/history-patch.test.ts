import { useLocation as reactHook } from "wouter";
import { useLocation as preactHook } from "wouter-preact";
import { renderHook, act } from "@testing-library/react";

import { vi, it, expect, describe } from "vitest";

describe("history patch", () => {
  it("exports should exists", () => {
    expect(reactHook).toBeDefined();
    expect(preactHook).toBeDefined();
  });

  it("history should be patched once", () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => reactHook());

    addEventListener("pushState", (e) => {
      fn();
    });

    expect(result.current[0]).toBe("/");
    expect(fn).toBeCalledTimes(0);

    act(() => result.current[1]("/hello"));
    act(() => result.current[1]("/world"));

    expect(result.current[0]).toBe("/world");
    expect(fn).toBeCalledTimes(2);

    unmount();
  });
});
