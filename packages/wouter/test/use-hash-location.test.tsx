import { it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useHashLocation } from "wouter/use-hash-location";

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

it("rerenders when hash changes", async () => {
  const { result } = renderHook(() => useHashLocation());

  expect(result.current[0]).toBe("/");

  await waitForHashChangeEvent(() => {
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
  history.replaceState(null, "", "/foo?bar#/app");

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

it("creates a new history entry when navigating", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  const initialLength = history.length;
  navigate("/about");
  expect(history.length).toBe(initialLength + 1);
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

it("uses `ssrPath` when rendered on the server", () => {
  const App = () => {
    const [path] = useHashLocation({ ssrPath: "/hello-from-server" });
    return <>{path}</>;
  };

  const rendered = renderToStaticMarkup(<App />);
  expect(rendered).toBe("/hello-from-server");
});

it("is not sensitive to leading / or # when navigating", async () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  await waitForHashChangeEvent(() => navigate("look-ma-no-slashes"));
  expect(location.hash).toBe("#/look-ma-no-slashes");
  expect(result.current[0]).toBe("/look-ma-no-slashes");

  await waitForHashChangeEvent(() => navigate("#/look-ma-no-hashes"));
  expect(location.hash).toBe("#/look-ma-no-hashes");
  expect(result.current[0]).toBe("/look-ma-no-hashes");
});

/**
 * Executes a callback and returns a promise that resolve when `hashchange` event is fired.
 * Rejects after `throwAfter` milliseconds.
 */
const waitForHashChangeEvent = async (cb: () => void, throwAfter = 1000) =>
  new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;

    const onChange = () => {
      resolve();
      clearTimeout(timeout);
      window.removeEventListener("hashchange", onChange);
    };

    window.addEventListener("hashchange", onChange);
    cb();

    timeout = setTimeout(() => {
      reject(new Error("Timed out: `hashchange` event did not fire!"));
      window.removeEventListener("hashchange", onChange);
    }, throwAfter);
  });
