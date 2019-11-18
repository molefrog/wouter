import { renderHook, act } from "@testing-library/react-hooks";
import useLocation from "../use-location.js";

it("returns a pair [value, update]", () => {
  const { result, unmount } = renderHook(() => useLocation());
  const [value, update] = result.current;

  expect(typeof value).toBe("string");
  expect(typeof update).toBe("function");
  unmount();
});

describe("`value` first argument", () => {
  beforeEach(() => history.replaceState(0, 0, "/"));

  it("reflects the current pathname", () => {
    const { result, unmount } = renderHook(() => useLocation());
    expect(result.current[0]).toBe("/");
    unmount();
  });

  it("reacts to `pushState` / `replaceState`", () => {
    const { result, unmount } = renderHook(() => useLocation());

    act(() => history.pushState(0, 0, "/foo"));
    expect(result.current[0]).toBe("/foo");

    act(() => history.replaceState(0, 0, "/bar"));
    expect(result.current[0]).toBe("/bar");
    unmount();
  });

  it("supports history.back() navigation", () => {
    jest.useFakeTimers();
    const { result, unmount } = renderHook(() => useLocation());

    act(() => history.pushState(0, 0, "/foo"));
    expect(result.current[0]).toBe("/foo");

    act(() => {
      history.back();
      jest.runAllTimers();
    });

    expect(result.current[0]).toBe("/");
    unmount();
  });

  it("returns a pathname without a basepath", () => {
    const { result, unmount } = renderHook(() =>
      useLocation({ basepath: "/app" })
    );

    act(() => history.pushState(0, 0, "/app/dashboard"));
    expect(result.current[0]).toBe("/dashboard");
    unmount();
  });
});

describe("`update` second parameter", () => {
  it("rerenders the component", () => {
    const { result, unmount } = renderHook(() => useLocation());
    const update = result.current[1];

    act(() => update("/about"));
    expect(result.current[0]).toBe("/about");
    unmount();
  });

  it("changes the current location", () => {
    const { result, unmount } = renderHook(() => useLocation());
    const update = result.current[1];

    act(() => update("/about"));
    expect(location.pathname).toBe("/about");
    unmount();
  });

  it("saves a new entry in the History object", () => {
    const { result, unmount } = renderHook(() => useLocation());
    const update = result.current[1];

    const histBefore = history.length;
    act(() => update("/about"));

    expect(history.length).toBe(histBefore + 1);
    unmount();
  });

  it("replaces last entry with a new entry in the History object", () => {
    const { result, unmount } = renderHook(() => useLocation());
    const update = result.current[1];

    const histBefore = history.length;
    act(() => update("/foo", true));

    expect(history.length).toBe(histBefore);
    expect(location.pathname).toBe("/foo");
    unmount();
  });

  it("stays the same reference between re-renders (function ref)", () => {
    const { result, rerender, unmount } = renderHook(() => useLocation());

    const updateWas = result.current[1];
    rerender();
    const updateNow = result.current[1];

    expect(updateWas).toBe(updateNow);
    unmount();
  });

  it("supports a basepath", () => {
    const { result, unmount } = renderHook(() =>
      useLocation({ basepath: "/app" })
    );
    const update = result.current[1];

    act(() => update("/dashboard"));
    expect(location.pathname).toBe("/app/dashboard");
    unmount();
  });
});
