import { it, expect } from "vitest";
import * as TestRenderer from "react-test-renderer";

import { Router, Route } from "wouter";
import type { MatcherFn } from "wouter/matcher";
import { memoryLocation } from "./test-utils.js";

// @ts-expect-error
const customMatcher: MatcherFn = (pattern: string, path: string) => {
  const reversed = path.replace(/^\//, "").split("").reverse().join("");

  return [pattern.replace(/^\//, "") === reversed, null];
};

const routeMatches = (pattern: string, path: string) => {
  const instance = TestRenderer.create(
    <Router hook={memoryLocation(path).hook} matcher={customMatcher}>
      <Route path={pattern}>
        <h1>it worked!</h1>
      </Route>
    </Router>
  ).root;

  let phrase = null;

  try {
    phrase = instance.findByType("h1").props.children;
  } catch (e) {}

  return phrase === "it worked!";
};

it("accepts plain children", () => {
  expect(routeMatches("/foo", "/oof")).toBe(true);
  expect(routeMatches("/xxx", "/xxx")).toBe(true);
  expect(routeMatches("/path", "/path")).toBe(false);
});
