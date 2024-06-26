import { it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import * as TestRenderer from "react-test-renderer";

import { Router, Route } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { ReactElement } from "react";

const testRouteRender = (initialPath: string, jsx: ReactElement) => {
  const instance = TestRenderer.create(
    <Router hook={memoryLocation({ path: initialPath }).hook}>{jsx}</Router>
  ).root;

  return instance;
};

it("always renders its content when `path` is empty", () => {
  const result = testRouteRender(
    "/nothing",
    <Route>
      <h1>Hello!</h1>
    </Route>
  );

  expect(result.findByType("h1").props.children).toBe("Hello!");
});

it("accepts plain children", () => {
  const result = testRouteRender(
    "/foo",
    <Route path="/foo">
      <h1>Hello!</h1>
    </Route>
  );

  expect(result.findByType("h1").props.children).toBe("Hello!");
});

it("works with render props", () => {
  const result = testRouteRender(
    "/foo",
    <Route path="/foo">{() => <h1>Hello!</h1>}</Route>
  );

  expect(result.findByType("h1").props.children).toBe("Hello!");
});

it("passes a match param object to the render function", () => {
  const result = testRouteRender(
    "/users/alex",
    <Route path="/users/:name">{(params) => <h1>{params.name}</h1>}</Route>
  );

  expect(result.findByType("h1").props.children).toBe("alex");
});

it("renders nothing when there is not match", () => {
  const result = testRouteRender(
    "/bar",
    <Route path="/foo">
      <div>Hi!</div>
    </Route>
  );

  expect(() => result.findByType("div")).toThrow();
});

it("supports `component` prop similar to React-Router", () => {
  const Users = () => <h2>All users</h2>;

  const result = testRouteRender(
    "/foo",
    <Route path="/foo" component={Users} />
  );

  expect(result.findByType("h2").props.children).toBe("All users");
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

  expect(container.childNodes.length).toBe(1);
  expect((container.firstChild as HTMLElement).tagName).toBe("H1");

  unmount();
});

it("supports `path` prop with regex", () => {
  const result = testRouteRender(
    "/foo",
    <Route path={/[/]foo/}>
      <h1>Hello!</h1>
    </Route>
  );

  expect(result.findByType("h1").props.children).toBe("Hello!");
});

it("supports regex path named params", () => {
  const result = testRouteRender(
    "/users/alex",
    <Route path={/[/]users[/](?<name>[a-z]+)/}>
      {(params) => <h1>{params.name}</h1>}
    </Route>
  );

  expect(result.findByType("h1").props.children).toBe("alex");
});

it("supports regex path anonymous params", () => {
  const result = testRouteRender(
    "/users/alex",
    <Route path={/[/]users[/]([a-z]+)/}>
      {(params) => <h1>{params[0]}</h1>}
    </Route>
  );

  expect(result.findByType("h1").props.children).toBe("alex");
});

it("rejects when a path does not match the regex", () => {
  const result = testRouteRender(
    "/users/1234",
    <Route path={/[/]users[/](?<name>[a-z]+)/}>
      {(params) => <h1>{params.name}</h1>}
    </Route>
  );

  expect(() => result.findByType("h1")).toThrow();
});
