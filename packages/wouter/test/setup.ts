import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";

// Register happy-dom globals (document, window, etc.)
GlobalRegistrator.register({
  url: "https://wouter.dev",
  width: 1024,
  height: 768,
});

// Extend Bun's expect with jest-dom matchers
(expect as any).extend(matchers);

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
