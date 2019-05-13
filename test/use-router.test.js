import React from "react";
import { renderHook, act } from "react-hooks-testing-library";

import { Router, useRouter } from "../index.js";

it("creates a router object on demand", () => {
  const { result } = renderHook(() => useRouter());
  expect(result.current).toBeInstanceOf(Object);
});

it("creates a router object only once", () => {
  const { result, rerender } = renderHook(() => useRouter());
  const router = result.current;

  rerender();
  expect(result.current).toBe(router);
});

it("caches the router object if Router rerenders", () => {
  const { result, rerender } = renderHook(() => useRouter(), {
    wrapper: props => <Router>{props.children}</Router>
  });
  const router = result.current;

  rerender();
  expect(result.current).toBe(router);
});

it("returns customized router provided by the <Router />", () => {
  const newMatcher = () => "n00p";

  const { result } = renderHook(() => useRouter(), {
    wrapper: props => <Router matcher={newMatcher}>{props.children}</Router>
  });
  const router = result.current;

  expect(router).toBeInstanceOf(Object);
  expect(router.matcher).toBe(newMatcher);
});
