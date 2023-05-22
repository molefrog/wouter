import { renderHook, act } from "@testing-library/react";
import staticLocation from "../static-location.js";

it("is a static hook factory", () => {
  const hook = staticLocation("/never-gonna-give");
  const {
    result: {
      current: [value, update],
    },
  } = renderHook(() => hook());

  expect(value).toBe("/never-gonna-give");
  expect(update).toBeInstanceOf(Function);
});

it("doesn't change the value even if updated", () => {
  const hook = staticLocation("/try-changing-me");
  const { result } = renderHook(() => hook());
  const [, update] = result.current;

  act(() => {
    update("/change");
  });

  expect(result.current[0]).toBe("/try-changing-me");
});

it("records no history by default", () => {
  const hook = staticLocation("/page1");
  const { result } = renderHook(() => hook());
  const [, update] = result.current;

  act(() => {
    update("/page2");
  });

  expect(hook.history).toEqual(["/page1"]);
});

it("records history if requested but does not change the value", () => {
  const hook = staticLocation("/page1", { record: true });
  const { result } = renderHook(() => hook());
  const [, update] = result.current;

  act(() => {
    update("/page2");
  });

  expect(hook.history).toEqual(["/page1", "/page2"]);
  expect(result.current[0]).toBe("/page1");
});

it("respects the 'replace' option", () => {
  const hook = staticLocation("/page1", { record: true });
  const { result } = renderHook(() => hook());
  const [, update] = result.current;

  act(() => {
    update("/page2", { replace: true });
  });

  expect(hook.history).toEqual(["/page2"]);
  expect(result.current[0]).toBe("/page1");
});

it("supports a basepath", () => {
  const hook = staticLocation("/app", { record: true });
  const { result } = renderHook(() => hook({ base: "/app" }));
  const [, update] = result.current;

  act(() => update("/dashboard"));
  expect(hook.history).toEqual(["/app", "/app/dashboard"]);
});
