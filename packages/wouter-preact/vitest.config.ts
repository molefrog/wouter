import { defineProject } from "vitest/config";
import preact from "@preact/preset-vite";
import { resolve } from "node:path";

export default defineProject({
  plugins: [preact()],
  resolve: {
    alias: {
      // wouter-preact uses wouter's source but replaces react-deps with preact-deps
      "./react-deps.js": resolve(__dirname, "./src/preact-deps.js"),
      "wouter-preact/use-browser-location": resolve(__dirname, "../wouter/src/use-browser-location.js"),
      "wouter-preact/use-hash-location": resolve(__dirname, "../wouter/src/use-hash-location.js"),
      "wouter-preact/memory-location": resolve(__dirname, "../wouter/src/memory-location.js"),
      "wouter-preact": resolve(__dirname, "../wouter/src/index.js"),
      "wouter": resolve(__dirname, "../wouter/src/index.js"),
    },
  },
  test: {
    name: "wouter-preact",
    globals: true,
    environment: "happy-dom",
    setupFiles: "./setup-vitest.ts",
  },
});
