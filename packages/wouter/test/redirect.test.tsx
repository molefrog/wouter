import { test, expect } from "bun:test";
import { render } from "@testing-library/react";
import { useState } from "react";

import { Redirect, Router } from "../src/index.js";

export const customHookWithReturn =
  (initialPath = "/") =>
  () => {
    const [path, updatePath] = useState(initialPath);
    const navigate = (path: string) => {
      updatePath(path);
      return "foo";
    };

    return [path, navigate];
  };

test("renders nothing", () => {
  const { container, unmount } = render(<Redirect to="/users" />);
  expect(container.childNodes.length).toBe(0);
  unmount();
});

test("results in change of current location", () => {
  const { unmount } = render(<Redirect to="/users" />);

  expect(location.pathname).toBe("/users");
  unmount();
});

test("supports `base` routers with relative path", () => {
  const { unmount } = render(
    <Router base="/app">
      <Redirect to="/nested" />
    </Router>
  );

  expect(location.pathname).toBe("/app/nested");
  unmount();
});

test("supports `base` routers with absolute path", () => {
  const { unmount } = render(
    <Router base="/app">
      <Redirect to="~/absolute" />
    </Router>
  );

  expect(location.pathname).toBe("/absolute");
  unmount();
});

test("supports replace navigation", () => {
  const histBefore = history.length;

  const { unmount } = render(<Redirect to="/users" replace />);

  expect(location.pathname).toBe("/users");
  expect(history.length).toBe(histBefore);
  unmount();
});

test("supports history state", () => {
  const testState = { hello: "world" };
  const { unmount } = render(<Redirect to="/users" state={testState} />);

  expect(location.pathname).toBe("/users");
  expect(history.state).toStrictEqual(testState);
  unmount();
});

test("useLayoutEffect should return nothing", () => {
  const { unmount } = render(
    // @ts-expect-error
    <Router hook={customHookWithReturn()}>
      <Redirect to="/users" replace />
    </Router>
  );

  expect(location.pathname).toBe("/users");
  unmount();
});
