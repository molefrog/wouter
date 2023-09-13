import { it, expect } from "vitest";

import { pathToRegexp, Key } from "path-to-regexp";
import { renderHook, act } from "@testing-library/react";

import * as TestRenderer from "react-test-renderer";

import { Router, Route, useRouter, useRoute } from "wouter";
import type { MatcherFn } from "wouter/matcher";
import { memoryLocation } from "./test-utils.js";

// Custom parser that uses `path-to-regexp` instead of `regexparam`
const pathToRegexpParser = (route: string) => {
  const keys: Key[] = [];
  const pattern = pathToRegexp(route, keys);

  return { pattern, keys: keys.map((k) => k.name) };
};

it("overrides the `parser` prop on the current router", () => {
  const { result } = renderHook(() => useRouter(), {
    wrapper: ({ children }) => (
      <Router parser={pathToRegexpParser}>{children}</Router>
    ),
  });

  const router = result.current;
  expect(router.parser).toBe(pathToRegexpParser);
});

it("allows to change the behaviour of route matching", () => {
  const { result } = renderHook(
    () => useRoute("/(home|dashboard)/:pages?/users/:rest*"),
    {
      wrapper: ({ children }) => (
        <Router
          hook={memoryLocation("/home/users/10/bio").hook}
          parser={pathToRegexpParser}
        >
          {children}
        </Router>
      ),
    }
  );

  expect(result.current).toStrictEqual([
    true,
    { pages: undefined, rest: "10/bio", 0: "home" },
  ]);
});
