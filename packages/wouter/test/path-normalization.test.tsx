import { test, expect } from "bun:test";
import { renderHook } from "@testing-library/react";
import { Router, useLocation } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";

test.each([
  [undefined, "", "/"],
  ["", "", "/"],
  ["/", "", "/"],
  ["/", "/users", "/users"],
  ["", "/hello%20world%", "/hello%20world%"],
  ["/hello%20world%", "/hello%20world%/users", "/users"],
  ["/app", "/app%2Fusers", "%2Fusers"],
  ["/ΟΣ", "/ΟΣΑ", "~/ΟΣΑ"],
  ["/İ", "/i\u0307/users", "\u0307/users"],
])("normalizes base %j and location %j to %j", (base, path, expected) => {
  const { hook } = memoryLocation({ path });
  const { result } = renderHook(() => useLocation(), {
    wrapper: ({ children }) => (
      <Router base={base} hook={hook}>
        {children}
      </Router>
    ),
  });

  expect(result.current[0]).toBe(expected);
});
