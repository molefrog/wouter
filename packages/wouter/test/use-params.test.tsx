import { act, renderHook } from "@testing-library/react";
import { it, expect } from "vitest";
import { useParams, Router, Route } from "wouter";

import { memoryLocation } from "wouter/memory-location";

it("returns empty object when used outside of <Route />", () => {
  const { result } = renderHook(() => useParams());
  expect(result.current).toEqual({});
});

it("contains a * parameter when used inside an empty <Route />", () => {
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

it("returns an empty object when there are no params", () => {
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => <Route path="/">{props.children}</Route>,
  });

  expect(result.current).toEqual({});
});

it("returns parameters from the closest parent <Route /> match", () => {
  const { result } = renderHook(() => useParams(), {
    wrapper: (props) => (
      <Router hook={memoryLocation({ path: "/app/users/1/maria" }).hook}>
        <Route path="/app/:foo/*">
          <Route path="/app/users/:id/:name">{props.children}</Route>
        </Route>
      </Router>
    ),
  });

  expect(result.current).toEqual({
    0: "1",
    1: "maria",
    id: "1",
    name: "maria",
  });
});

it("rerenders with parameters change", () => {
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
  expect(result.current).toEqual({
    0: "posts",
    1: "all",
    a: "posts",
    b: "all",
  });

  act(() => navigate("/posts/latest"));
  expect(result.current).toEqual({
    0: "posts",
    1: "latest",
    a: "posts",
    b: "latest",
  });
});

it("extracts parameters of the nested route", () => {
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
