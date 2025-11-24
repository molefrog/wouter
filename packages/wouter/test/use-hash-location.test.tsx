import { test, expect, beforeEach, mock } from "bun:test";
import { renderHook, render, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { Router, Route, useLocation, Link } from "../src/index.js";
import { useHashLocation } from "../src/use-hash-location.js";

import { waitForHashChangeEvent } from "./test-utils";
import { ReactNode, useSyncExternalStore } from "react";

beforeEach(() => {
  history.replaceState(null, "", "/");
  location.hash = "";
});

test("gets current location from `location.hash`", () => {
  location.hash = "/app/users";
  const { result } = renderHook(() => useHashLocation());
  const [path] = result.current;

  expect(path).toBe("/app/users");
});

test("isn't sensitive to leading slash", () => {
  location.hash = "app/users";
  const { result } = renderHook(() => useHashLocation());
  const [path] = result.current;

  expect(path).toBe("/app/users");
});

test("rerenders when hash changes", async () => {
  const { result } = renderHook(() => useHashLocation());

  expect(result.current[0]).toBe("/");

  await act(async () => {
    await waitForHashChangeEvent(() => {
      location.hash = "/app/users";
    });
  });

  expect(result.current[0]).toBe("/app/users");
});

test("changes current hash when navigation is performed", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  act(() => {
    navigate("/app/users");
  });
  expect(location.hash).toBe("#/app/users");
});

test("should not rerender when pathname changes", () => {
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

test("does not change anything besides the hash when doesn't contain ? symbol", () => {
  history.replaceState(null, "", "/foo?bar#/app");

  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  act(() => {
    navigate("/settings/general");
  });
  expect(location.pathname).toBe("/foo");
  expect(location.search).toBe("?bar");
});

test("changes search and hash when contains ? symbol", () => {
  history.replaceState(null, "", "/foo?bar#/app");

  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  act(() => {
    navigate("/abc?def");
  });
  expect(location.pathname).toBe("/foo");
  expect(location.search).toBe("?def");
  expect(location.hash).toBe("#/abc");
});

test("creates a new history entry when navigating", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  const initialLength = history.length;
  act(() => {
    navigate("/about");
  });
  expect(history.length).toBe(initialLength + 1);
});

test("supports `state` option when navigating", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  act(() => {
    navigate("/app/users", { state: { hello: "world" } });
  });
  expect(history.state).toStrictEqual({ hello: "world" });
});

test("never changes reference to `navigate` between rerenders", () => {
  const { result, rerender } = renderHook(() => useHashLocation());

  const updateWas = result.current[1];
  rerender();

  expect(result.current[1]).toBe(updateWas);
});

test("uses `ssrPath` when rendered on the server", () => {
  const App = () => {
    const [path] = useHashLocation({ ssrPath: "/hello-from-server" });
    return <>{path}</>;
  };

  const rendered = renderToStaticMarkup(<App />);
  expect(rendered).toBe("/hello-from-server");
});

test("is not sensitive to leading / or # when navigating", async () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  await act(async () => {
    await waitForHashChangeEvent(() => navigate("look-ma-no-slashes"));
  });
  expect(location.hash).toBe("#/look-ma-no-slashes");
  expect(result.current[0]).toBe("/look-ma-no-slashes");

  await act(async () => {
    await waitForHashChangeEvent(() => navigate("#/look-ma-no-hashes"));
  });
  expect(location.hash).toBe("#/look-ma-no-hashes");
  expect(result.current[0]).toBe("/look-ma-no-hashes");
});

test("works even if `hashchange` listeners are called asynchronously ", async () => {
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

  act(() => {
    location.hash = "#/a";
  });

  const { unmount } = render(
    <Router hook={useHashLocation}>
      <Route path="/a">
        <InterceptAndStopHashchange>
          <LogLocations />
        </InterceptAndStopHashchange>
      </Route>
    </Router>
  );

  await act(async () => {
    location.hash = "#/b";
    // wait for all `hashchange` listeners to be called
    // can't use `waitForHashChangeEvent` here because it gets cancelled along the way
    await nextTick();
  });

  // paths should not contain "b", because the outer route
  // does not match, so inner component should not be rendered
  expect(paths).toEqual(["/a"]);
  unmount();
});

test("defines a custom way of rendering link hrefs", () => {
  const { getByTestId } = render(
    <Router hook={useHashLocation}>
      <Link href="/app" data-testid="link" />
    </Router>
  );

  expect(getByTestId("link")).toHaveAttribute("href", "#/app");
});

test("handles navigation with data: protocol", async () => {
  const originalHref = location.href;
  location.href = "data:text/html,content";

  expect(location.protocol).toBe("data:");

  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;
  const initialHistoryLength = history.length;

  await waitForHashChangeEvent(() => {
    navigate("/new-path");
  });

  expect(location.hash).toBe("#/new-path");
  expect(history.length).toBe(initialHistoryLength + 1);

  await waitForHashChangeEvent(() => {
    navigate("/another-path", { replace: true });
  });

  expect(location.hash).toBe("#/another-path");
  expect(history.length).toBe(initialHistoryLength + 1);

  location.href = originalHref;
});

test("interacts properly with the history stack", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  // case: replace, expect no history stack changes
  const historyStackCountBeforeReplace = history.length;
  act(() => {
    navigate("/app/users", { replace: true });
  });
  expect(location.hash).toBe("#/app/users");
  expect(history.length).toBe(historyStackCountBeforeReplace);

  // case: push, expect history stack increase by 1
  const historyStackCountBeforePush = history.length;
  act(() => {
    navigate("/app/users/2");
  });
  expect(location.hash).toBe("#/app/users/2");
  expect(history.length).toBe(historyStackCountBeforePush + 1);
});

test("dispatches hashchange event when options.replace is true", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  const hashChangeFn = mock();
  addEventListener("hashchange", hashChangeFn);

  act(() => {
    navigate("/foo/bar", { replace: true });
  });
  expect(hashChangeFn).toBeCalled();

  removeEventListener("hashchange", hashChangeFn);
});

test("detects history change when navigate with options.replace is called", async () => {
  const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  const newPath = "/foo/bar/baz";
  act(() => {
    navigate(newPath, { replace: true });
  });
  await nextTick();
  expect(result.current[0]).toBe(newPath);
});

test("uses string URLs as hashchange event payload", () => {
  const { result } = renderHook(() => useHashLocation());
  const [, navigate] = result.current;

  const relativeOldPath = "/foo";
  const relativeNewPath = "/foo/bar/#hash";
  const baseURL = "https://wouter.dev/#";

  act(() => {
    navigate(relativeOldPath);
  });

  let changeEvent = new HashChangeEvent("hashchange");
  const hashChangeFn = (event: HashChangeEvent) => {
    changeEvent = event;
  };

  addEventListener("hashchange", hashChangeFn);

  act(() => {
    navigate(relativeNewPath);
  });
  expect(changeEvent?.newURL).toBe(`${baseURL}${relativeNewPath}`);
  expect(changeEvent?.oldURL).toBe(`${baseURL}${relativeOldPath}`);

  removeEventListener("hashchange", hashChangeFn);
});
