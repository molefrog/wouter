import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { expect, beforeEach, afterEach } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Register happy-dom globals (document, window, etc.)
GlobalRegistrator.register({
  url: "https://wouter.dev",
  width: 1024,
  height: 768,
});

// Extend Bun's expect with jest-dom matchers
(expect as any).extend(matchers);

// Load the library first so the history monkey-patch in use-browser-location.js
// is applied (and attributed) to this copy of the module, not the temporary
// wouter-preact copy created by preact.test.tsx. Must run after happy-dom
// registration, hence a dynamic import.
await import("../src/use-browser-location.js");

/**
 * Runs a function with `location` temporarily removed from globalThis.
 * Simulates pure Node.js SSR environment for testing.
 */
export const withoutLocation = <T>(fn: () => T): T => {
  const original = globalThis.location;
  // @ts-expect-error - intentionally removing location
  delete globalThis.location;
  try {
    return fn();
  } finally {
    globalThis.location = original;
  }
};

beforeEach(() => {
  history.go(-history.length + 1);
  history.replaceState(null, "", "/");
});

afterEach(cleanup);
