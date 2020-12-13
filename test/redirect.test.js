import React from "react";
import { render } from "@testing-library/react";

import { Redirect, Router } from "../index.js";
import { customHookWithReturn } from "./test-utils.js";

it("renders nothing", () => {
  const { container, unmount } = render(<Redirect to="/users" />);
  expect(container.childNodes.length).toBe(0);
  unmount();
});

it("results in change of current location", () => {
  const { unmount } = render(<Redirect to="/users" />);

  expect(location.pathname).toBe("/users");
  unmount();
});

it("supports `base` routers with relative path", () => {
  const { unmount } = render(
    <Router base="/app">
      <Redirect to="/nested" />
    </Router>
  );

  expect(location.pathname).toBe("/app/nested");
  unmount();
});

it("supports `base` routers with absolute path", () => {
  const { unmount } = render(
    <Router base="/app">
      <Redirect to="~/absolute" />
    </Router>
  );

  expect(location.pathname).toBe("/absolute");
  unmount();
});

it("supports replace navigation", () => {
  const histBefore = history.length;

  const { unmount } = render(<Redirect to="/users" replace />);

  expect(location.pathname).toBe("/users");
  expect(history.length).toBe(histBefore);
  unmount();
});

it("useLayoutEffect should return nothing", () => {
  const { unmount } = render(
    <Router hook={customHookWithReturn()}>
      <Redirect to="/users" replace />
    </Router>
  );

  expect(location.pathname).toBe("/users");
  unmount();
});
