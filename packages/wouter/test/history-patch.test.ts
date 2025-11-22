import { useLocation as reactHook } from "../src/index.js";
import { useLocation as preactHook } from "../src/index.js";
import { renderHook, act } from "@testing-library/react";

import { mock, test, expect, describe } from "bun:test";

describe("history patch", () => {
  test("exports should exists", () => {
    expect(reactHook).toBeDefined();
    expect(preactHook).toBeDefined();
  });

  test("history should be patched once", () => {
    const fn = mock();
    const { result, unmount } = renderHook(() => reactHook());

    addEventListener("pushState", (e) => {
      fn();
    });

    expect(result.current[0]).toBe("/");
    expect(fn).toHaveBeenCalledTimes(0);

    act(() => result.current[1]("/hello"));
    act(() => result.current[1]("/world"));

    expect(result.current[0]).toBe("/world");
    expect(fn).toHaveBeenCalledTimes(2);

    unmount();
  });
});
