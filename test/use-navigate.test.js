import { renderHook, act } from "@testing-library/react-hooks";
import useLocation from "../use-location.js";
import { useNavigate } from "../index.js";

it("returns a pair [value, navigate]", () => {
  const { result, unmount } = renderHook(() => useNavigate());
  const navigate = result.current;

  expect(typeof navigate).toBe("function");
  unmount();
});

describe("useNavigate", () => {
  it("rerenders the component", () => {
    const navigateState = renderHook(() => useNavigate());
    const locationState = renderHook(() => useLocation());
    const navigate = navigateState.result.current;

    act(() => navigate("/about"));
    expect(locationState.result.current).toBe("/about");
    navigateState.unmount();
    locationState.unmount();
  });

  it("changes the current location", () => {
    const { result, unmount } = renderHook(() => useNavigate());
    const navigate = result.current;

    act(() => navigate("/about"));
    expect(location.pathname).toBe("/about");
    unmount();
  });

  it("saves a new entry in the History object", () => {
    const { result, unmount } = renderHook(() => useNavigate());
    const navigate = result.current;

    const histBefore = history.length;
    act(() => navigate("/about"));

    expect(history.length).toBe(histBefore + 1);
    unmount();
  });

  it("replaces last entry with a new entry in the History object", () => {
    const { result, unmount } = renderHook(() => useNavigate());
    const navigate = result.current;

    const histBefore = history.length;
    act(() => navigate("/foo", { replace: true }));

    expect(history.length).toBe(histBefore);
    expect(location.pathname).toBe("/foo");
    unmount();
  });

  it("stays the same reference between re-renders (function ref)", () => {
    const { result, rerender, unmount } = renderHook(() => useNavigate());

    const updateWas = result.current;
    rerender();
    const updateNow = result.current;

    expect(updateWas).toBe(updateNow);
    unmount();
  });
});
