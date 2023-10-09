import { it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const useHashLocation = (): [string, (to: string) => void] => [
  "/",
  (to: string) => {},
];

beforeEach(() => {
  history.replaceState(null, "", "/");
  location.hash = "";
});

it("gets current location from `location.hash`", () => {
  location.hash = "/app/users";
  const { result } = renderHook(() => useHashLocation());
  const [path] = result.current;

  expect(path).toBe("/app/users");
});

it("isn't sensitive to leading slash", () => {
  location.hash = "app/users";
  const { result } = renderHook(() => useHashLocation());
  const [path] = result.current;

  expect(path).toBe("/app/users");
});

it("rerenders when hash changes", () => {
  const { result } = renderHook(() => useHashLocation());
  const [path] = result.current;

  expect(path).toBe("/");

  act(() => {
    location.hash = "/app/users";
  });

  expect(result.current[0]).toBe("/app/users");
});

it("changes current hash when navigation is performed", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  navigate("/app/users");
  expect(location.hash).toBe("#/app/users");
});

it("should not rerender when pathname changes", () => {
  let renderCount = 0;
  location.hash = "/app";

  const { result } = renderHook(() => {
    useHashLocation();
    return ++renderCount;
  });

  expect(result.current).toBe(1);
  act(() => {
    history.replaceState(null, "", "/foo?bar#/app");
  });

  expect(result.current).toBe(1);
});

it("does not change anything besides the hash", () => {
  history.replaceState(null, "", "/foo?bar#/app");

  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  navigate("/settings/general");
  expect(location.pathname).toBe("/foo");
  expect(location.search).toBe("?bar");
});

it("supports `state` option when navigating", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  navigate("/app/users", { state: { hello: "world" } });
  expect(history.state).toStrictEqual({ hello: "world" });
});

it("never changes reference to `navigate` between rerenders", () => {
  const { result, rerender } = renderHook(() => useHashLocation());

  const updateWas = result.current[1];
  rerender();

  expect(result.current[1]).toBe(updateWas);
});
