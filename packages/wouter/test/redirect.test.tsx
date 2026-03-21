import { test, expect } from "bun:test";
import { render } from "@testing-library/react";

import { Redirect, Router } from "../src/index.js";

test("renders nothing", () => {
  const { container } = render(<Redirect to="/users" />);
  expect(container.childNodes.length).toBe(0);
});

test("results in change of current location", () => {
  render(<Redirect to="/users" />);

  expect(location.pathname).toBe("/users");
});

test("supports `base` routers with relative path", () => {
  render(
    <Router base="/app">
      <Redirect to="/nested" />
    </Router>
  );

  expect(location.pathname).toBe("/app/nested");
});

test("supports `base` routers with absolute path", () => {
  render(
    <Router base="/app">
      <Redirect to="~/absolute" />
    </Router>
  );

  expect(location.pathname).toBe("/absolute");
});

test("supports replace navigation", () => {
  const histBefore = history.length;

  render(<Redirect to="/users" replace />);

  expect(location.pathname).toBe("/users");
  expect(history.length).toBe(histBefore);
});

test("supports history state", () => {
  const testState = { hello: "world" };
  render(<Redirect to="/users" state={testState} />);

  expect(location.pathname).toBe("/users");
  expect(history.state).toStrictEqual(testState);
});
