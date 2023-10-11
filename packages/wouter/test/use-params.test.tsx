import { act, renderHook } from "@testing-library/react";
import { vi, it, expect } from "vitest";
import { useParams, Router, Route } from "wouter";

import { memoryLocation } from "wouter/memory-location";

it("returns `null` when used outside of <Route />", () => {
  const { result } = renderHook(() => useParams());
  expect(result.current).toBeNull();
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

  expect(result.current).toEqual({ id: "1", name: "maria" });
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
  expect(result.current).toEqual({ a: "posts", b: "all" });

  act(() => navigate("/posts/latest"));
  expect(result.current).toEqual({ a: "posts", b: "latest" });
});
