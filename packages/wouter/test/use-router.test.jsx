import { cloneElement } from "react";
import { renderHook } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
import { it, expect } from "vitest";
import { Router, useRouter } from "wouter";

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
    wrapper: (props) => <Router>{props.children}</Router>,
  });
  const router = result.current;

  rerender();
  expect(result.current).toBe(router);
});

it("returns customized router provided by the <Router />", () => {
  const newMatcher = () => "n00p";

  const { result } = renderHook(() => useRouter(), {
    wrapper: (props) => <Router matcher={newMatcher}>{props.children}</Router>,
  });
  const router = result.current;

  expect(router).toBeInstanceOf(Object);
  expect(router.matcher).toBe(newMatcher);
});

it("shares one router instance between components", () => {
  const RouterGetter = ({ el }) => {
    const router = useRouter();
    return cloneElement(el, { router: router });
  };

  const { root } = TestRenderer.create(
    <>
      <RouterGetter el={<div />} />
      <RouterGetter el={<div />} />
      <RouterGetter el={<div />} />
      <RouterGetter el={<div />} />
    </>
  );

  const uniqRouters = [
    ...new Set(root.findAllByType("div").map((x) => x.props.router)),
  ];
  expect(uniqRouters.length).toBe(1);
});

it("inherits base path from the parent router when parent router is provided", () => {
  const NestedRouter = (props) => {
    const parent = useRouter();
    return <Router {...props} parent={props.nested ? parent : undefined} />;
  };

  const { result } = renderHook(() => useRouter(), {
    wrapper: (props) => (
      <Router base="/app">
        <NestedRouter base="/users" nested>
          {props.children}
        </NestedRouter>
      </Router>
    ),
  });

  const router = result.current;
  expect(router.parent.base).toBe("/app");
  expect(router.base).toBe("/app/users");
});

it("does not inherit base path by default", () => {
  const { result } = renderHook(() => useRouter(), {
    wrapper: (props) => (
      <Router base="/app">
        <Router base="/users">{props.children}</Router>
      </Router>
    ),
  });

  const router = result.current;
  expect(router.base).toBe("/users");
  expect(router.parent).toBe(undefined);
});
