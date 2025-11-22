import { test, expect } from "bun:test";

import { pathToRegexp, Key } from "path-to-regexp";
import { renderHook } from "@testing-library/react";

import { Router, useRouter, useRoute, Parser } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";

// Custom parser that uses `path-to-regexp` instead of `regexparam`
const pathToRegexpParser: Parser = (route: string) => {
  const keys: Key[] = [];
  const pattern = pathToRegexp(route, keys);

  return { pattern, keys: keys.map((k) => String(k.name)) };
};

test("overrides the `parser` prop on the current router", () => {
  const { result } = renderHook(() => useRouter(), {
    wrapper: ({ children }) => (
      <Router parser={pathToRegexpParser}>{children}</Router>
    ),
  });

  const router = result.current;
  expect(router.parser).toBe(pathToRegexpParser);
});

test("allows to change the behaviour of route matching", () => {
  const { result } = renderHook(
    () => useRoute("/(home|dashboard)/:pages?/users/:rest*"),
    {
      wrapper: ({ children }) => (
        <Router
          hook={memoryLocation({ path: "/home/users/10/bio" }).hook}
          parser={pathToRegexpParser}
        >
          {children}
        </Router>
      ),
    }
  );

  expect(result.current).toStrictEqual([
    true,
    {
      0: "home",
      1: undefined,
      2: "10/bio",
      pages: undefined,
      rest: "10/bio",
    } as any,
  ]);
});
