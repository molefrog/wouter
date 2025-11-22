import { defineProject } from "vitest/config";
import preact from "@preact/preset-vite";
import { resolve } from "node:path";

export default defineProject({
  plugins: [preact()],
  resolve: {
    alias: {
      // wouter-preact uses its own source files (copied from wouter with react-deps -> Preact version)
      "./react-deps.js": resolve(__dirname, "./src/react-deps.js"),
      "wouter-preact/use-browser-location": resolve(__dirname, "./src/use-browser-location.js"),
      "wouter-preact/use-hash-location": resolve(__dirname, "./src/use-hash-location.js"),
      "wouter-preact/memory-location": resolve(__dirname, "./src/memory-location.js"),
      "wouter-preact": resolve(__dirname, "./src/index.js"),
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
