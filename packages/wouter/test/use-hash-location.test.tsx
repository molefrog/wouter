import { it, expect, beforeEach } from "vitest";
import { renderHook, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { Router, Route, useLocation, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import { waitForHashChangeEvent } from "./test-utils";
import { ReactNode, useSyncExternalStore } from "react";

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

it("works even if `hashchange` listeners are called asynchronously ", async () => {
  const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

  // we want `hashchange` to stop invoking listeners before it reaches the
  // outer <Route path="/a" />. this is done to simulate a situation when
  // `hashchange` listeners are called asynchrounously
  //
  // per https://github.com/whatwg/html/issues/1792
  // some browsers fire `hashchange` and `popstate` asynchronously, so
  // when the event listeners are called, a microtask can be scheduled in between,
  // and we may end up with a teared state. inner components subscribe to `hashchange`
  // earlier so they may render even though their parent route does not match
  const subscribeToHashchange = (cb: () => void) => {
    const fn = (event: HashChangeEvent) => {
      event.stopImmediatePropagation();
      cb();
    };

    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  };

  const InterceptAndStopHashchange = ({
    children,
  }: {
    children: ReactNode;
  }) => {
    useSyncExternalStore(subscribeToHashchange, () => true);
    return <>{children}</>;
  };

  const paths: string[] = [];

  // keep track of rendered paths
  const LogLocations = () => {
    paths.push(useLocation()[0]);
    return null;
  };

  location.hash = "#/a";

  const { unmount } = render(
    <Router hook={useHashLocation}>
      <Route path="/a">
        <InterceptAndStopHashchange>
          <LogLocations />
        </InterceptAndStopHashchange>
      </Route>
    </Router>
  );

  location.hash = "#/b";

  // wait for all `hashchange` listeners to be called
  // can't use `waitForHashChangeEvent` here because it gets cancelled along the way
  await nextTick();

  // paths should not contain "b", because the outer route
  // does not match, so inner component should not be rendered
  expect(paths).toEqual(["/a"]);
  unmount();
});

it("defines a custom way of rendering link hrefs", () => {
  const { getByTestId } = render(
    <Router hook={useHashLocation}>
      <Link href="/app" data-testid="link" />
    </Router>
  );

  expect(getByTestId("link")).toHaveAttribute("href", "#/app");
});
