import React, { cloneElement } from "react";
import { renderHook } from "@testing-library/react-hooks";
import TestRenderer from "react-test-renderer";

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
