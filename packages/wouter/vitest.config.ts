import { defineProject } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineProject({
  plugins: [react({ jsxRuntime: "automatic" })],
  resolve: {
    alias: {
      // Point to source files instead of built files for coverage
      "wouter/use-browser-location": resolve(__dirname, "./src/use-browser-location.js"),
      "wouter/use-hash-location": resolve(__dirname, "./src/use-hash-location.js"),
      "wouter/memory-location": resolve(__dirname, "./src/memory-location.js"),
      "wouter": resolve(__dirname, "./src/index.js"),
      // wouter-preact uses wouter's source but with preact deps
      // This is needed for tests that import both wouter and wouter-preact
      "wouter-preact": resolve(__dirname, "./src/index.js"),
    },
  },
  test: {
    name: "wouter-react",
    globals: true,
    setupFiles: "./setup-vitest.ts",
    environment: "happy-dom",
  },
});
