import React from "react";
import TestRenderer from "react-test-renderer";

import { Router, Route } from "../index.js";
import { memoryLocation } from "./test-utils.js";

const customMatcher = (pattern, path) => {
  const reversed = path
    .replace(/^\//, "")
    .split("")
    .reverse()
    .join("");

  return [pattern.replace(/^\//, "") === reversed, {}];
};

const routeMatches = (pattern, path) => {
  const instance = TestRenderer.create(
    <Router hook={memoryLocation(path)} matcher={customMatcher}>
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
