/**
 * @vitest-environment node
 */

import { test, expect } from "vitest";

test("use-browser-location should work in node environment", () => {
  expect(() => import("wouter/use-browser-location")).not.toThrow();
});

test("wouter should work in node environment", () => {
  expect(() => import("wouter")).not.toThrow();
});
