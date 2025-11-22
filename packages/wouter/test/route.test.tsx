import { it, expect, afterEach } from "bun:test";
import { render, act, cleanup } from "@testing-library/react";

import { Router, Route } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";
import { ReactElement } from "react";

// Clean up after each test to avoid DOM pollution
afterEach(cleanup);

const testRouteRender = (initialPath: string, jsx: ReactElement) => {
  return render(
    <Router hook={memoryLocation({ path: initialPath }).hook}>{jsx}</Router>
  );
};

it("always renders its content when `path` is empty", () => {
  const { container } = testRouteRender(
    "/nothing",
    <Route>
      <h1>Hello!</h1>
    </Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("Hello!");
});

it("accepts plain children", () => {
  const { container } = testRouteRender(
    "/foo",
    <Route path="/foo">
      <h1>Hello!</h1>
    </Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("Hello!");
});

it("works with render props", () => {
  const { container } = testRouteRender(
    "/foo",
    <Route path="/foo">{() => <h1>Hello!</h1>}</Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("Hello!");
});

it("passes a match param object to the render function", () => {
  const { container } = testRouteRender(
    "/users/alex",
    <Route path="/users/:name">{(params) => <h1>{params.name}</h1>}</Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("alex");
});

it("renders nothing when there is not match", () => {
  const { container } = testRouteRender(
    "/bar",
    <Route path="/foo">
      <div>Hi!</div>
    </Route>
  );

  expect(container.querySelector("div")).not.toBeInTheDocument();
});

it("supports `component` prop similar to React-Router", () => {
  const Users = () => <h2>All users</h2>;

  const { container } = testRouteRender(
    "/foo",
    <Route path="/foo" component={Users} />
  );

  const heading = container.querySelector("h2");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("All users");
});

it("supports `base` routers with relative path", () => {
  const { container, unmount } = render(
    <Router base="/app">
      <Route path="/nested">
        <h1>Nested</h1>
      </Route>
      <Route path="~/absolute">
        <h2>Absolute</h2>
      </Route>
    </Router>
  );

  act(() => history.replaceState(null, "", "/app/nested"));

  expect(container.children).toHaveLength(1);
  expect(container.firstChild).toHaveProperty("tagName", "H1");

  unmount();
});

it("supports `path` prop with regex", () => {
  const { container } = testRouteRender(
    "/foo",
    <Route path={/[/]foo/}>
      <h1>Hello!</h1>
    </Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("Hello!");
});

it("supports regex path named params", () => {
  const { container } = testRouteRender(
    "/users/alex",
    <Route path={/[/]users[/](?<name>[a-z]+)/}>
      {(params) => <h1>{params.name}</h1>}
    </Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("alex");
});

it("supports regex path anonymous params", () => {
  const { container } = testRouteRender(
    "/users/alex",
    <Route path={/[/]users[/]([a-z]+)/}>
      {(params) => <h1>{params[0]}</h1>}
    </Route>
  );

  const heading = container.querySelector("h1");
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent("alex");
});

it("rejects when a path does not match the regex", () => {
  const { container } = testRouteRender(
    "/users/1234",
    <Route path={/[/]users[/](?<name>[a-z]+)/}>
      {(params) => <h1>{params.name}</h1>}
    </Route>
  );

  expect(container.querySelector("h1")).not.toBeInTheDocument();
});
