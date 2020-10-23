import { renderHook, act } from "@testing-library/react-hooks";
import useLocation from "../use-location.js";

it("returns a pair [value, update]", () => {
  const { result, unmount } = renderHook(() => useLocation());
  const value = result.current;

  expect(typeof value).toBe("string");
  unmount();
});

describe("`value` first argument", () => {
  beforeEach(() => history.replaceState(null, "", "/"));

  it("reflects the current pathname", () => {
    const { result, unmount } = renderHook(() => useLocation());
    expect(result.current).toBe("/");
    unmount();
  });

  it("reacts to `pushState` / `replaceState`", () => {
    const { result, unmount } = renderHook(() => useLocation());

    act(() => history.pushState(null, "", "/foo"));
    expect(result.current).toBe("/foo");

    act(() => history.replaceState(null, "", "/bar"));
    expect(result.current).toBe("/bar");
    unmount();
  });

  it("supports history.back() navigation", () => {
    jest.useFakeTimers();
    const { result, unmount } = renderHook(() => useLocation());

    act(() => history.pushState(null, "", "/foo"));
    expect(result.current).toBe("/foo");

    act(() => {
      history.back();
      jest.runAllTimers();
    });

    expect(result.current).toBe("/");
    unmount();
  });

  it("returns a pathname without a basepath", () => {
    const { result, unmount } = renderHook(() => useLocation({ base: "/app" }));

    act(() => history.pushState(null, "", "/app/dashboard"));
    expect(result.current).toBe("/dashboard");
    unmount();
  });

  it("returns `/` when URL contains only a basepath", () => {
    const { result, unmount } = renderHook(() => useLocation({ base: "/app" }));

    act(() => history.pushState(null, "", "/app"));
    expect(result.current).toBe("/");
    unmount();
  });

  it("bathpath should be case-insensitive", () => {
    const { result, unmount } = renderHook(() => useLocation({ base: "/App" }));

    act(() => history.pushState(null, "", "/app/dashboard"));
    expect(result.current).toBe("/dashboard");
    unmount();
  });
});
