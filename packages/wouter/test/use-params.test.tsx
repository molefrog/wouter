import { act, renderHook, cleanup } from "@testing-library/react";
import { test, expect, beforeEach, afterEach } from "bun:test";
import { useParams, Router, Route, Switch } from "../src/index.js";

import { memoryLocation } from "../src/memory-location.js";

beforeEach(() => history.replaceState(null, "", "/"));
afterEach(cleanup);

test("returns empty object when used outside of <Route />", () => {
  const { result } = renderHook(() => useParams());
  expect(result.current).toEqual({});
});

test("contains a * parameter when used inside an empty <Route />", () => {
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={memoryLocation({ path: "/app-2/goods/tees" }).hook}>
        <Route>{props.children}</Route>
      </Router>
    ),
  });

  expect(result.current).toEqual({
    0: "app-2/goods/tees",
    "*": "app-2/goods/tees",
  });
});

test("returns an empty object when there are no params", () => {
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => <Route path="/">{props.children}</Route>,
  });

  expect(result.current).toEqual({});
});

test("contains parameters from the closest parent <Route />", () => {
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={memoryLocation({ path: "/app/users/1/maria" }).hook}>
        <Route path="/app/:foo/*">
          <Route path="/app/users/:id/:name">{props.children}</Route>
        </Route>
      </Router>
    ),
  });

  expect(result.current).toMatchObject({
    0: "1",
    1: "maria",
    id: "1",
    name: "maria",
  });
});

test("inherits parameters from parent nested routes", () => {
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router
        hook={
          memoryLocation({ path: "/dash/users/10/alex/bio/john/summary-1" })
            .hook
        }
      >
        <Route path="/:page" nest>
          <Route path="/users/:id/:name" nest>
            <Route path="/bio/:name/*">{props.children}</Route>
          </Route>
        </Route>
      </Router>
    ),
  });

  expect(result.current).toMatchObject({
    name: "john", // name gets overriden
    "*": "summary-1",
    page: "dash",
    id: "10",
    // number params are overriden
    0: "john",
    1: "summary-1",
  });
});

test("rerenders with parameters change", () => {
  const { hook, navigate } = memoryLocation({ path: "/" });

  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={hook}>
        <Route path="/:a/:b">{props.children}</Route>
      </Router>
    ),
  });

  expect(result.current).toBeNull();

  act(() => navigate("/posts/all"));
  expect(result.current).toMatchObject({
    0: "posts",
    1: "all",
    a: "posts",
    b: "all",
  });

  act(() => navigate("/posts/latest"));
  expect(result.current).toMatchObject({
    0: "posts",
    1: "latest",
    a: "posts",
    b: "latest",
  });
});

test("extracts parameters of the nested route", () => {
  const { hook } = memoryLocation({
    path: "/v2/eth/txns",
    static: true,
  });

  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={hook}>
        <Route path="/:version/:chain?" nest>
          {props.children}
        </Route>
      </Router>
    ),
  });

  expect(result.current).toEqual({
    0: "v2",
    1: "eth",
    version: "v2",
    chain: "eth",
  });
});

test("keeps the object ref the same if params haven't changed", () => {
  const { hook } = memoryLocation({ path: "/foo/bar" });

  const { result, rerender } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={hook}>
        <Route path="/:a/:b/*?">{props.children}</Route>
      </Router>
    ),
  });

  const firstRenderedParams = result.current;
  rerender();
  expect(result.current).toBe(firstRenderedParams);
});

test("works when the route becomes matching", () => {
  const { hook, navigate } = memoryLocation({ path: "/" });

  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={hook}>
        <Route path="/:id">{props.children}</Route>
      </Router>
    ),
  });

  act(() => navigate("/123"));
  expect(result.current).toMatchObject({ id: "123" });
});

test("makes the params an empty object, when there are no path params", () => {
  const { hook, navigate } = memoryLocation({ path: "/" });

  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={hook}>
        <Switch>
          <Route path="/posts">{props.children}</Route>
          <Route path="/posts/:a">{props.children}</Route>
        </Switch>
      </Router>
    ),
  });

  act(() => navigate("/posts/all"));
  act(() => navigate("/posts"));
  expect(Object.keys(result.current).length).toBe(0);
});

test("removes route parameters when no longer present in the path", () => {
  // Start at a route that has both 'category' and 'page' in its params
  const { hook, navigate } = memoryLocation({
    path: "/products/categories/apple/page/1",
  });

  // Render useParams within two routes: one with /page/:page, one without
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={hook}>
        <Switch>
          <Route path="/products/categories/:category">{props.children}</Route>
          <Route path="/products/categories/:category/page/:page">
            {props.children}
          </Route>
        </Switch>
      </Router>
    ),
  });

  // Initial params should include 'category' and 'page'
  expect(result.current).toMatchObject({
    0: "apple",
    1: "1",
    category: "apple",
    page: "1",
  });

  // Navigate to a path that no longer contains the page param
  act(() => navigate("/products/categories/apple"));

  // The 'page' param should now be removed
  expect(result.current).toEqual({
    0: "apple",
    category: "apple",
  });
});
