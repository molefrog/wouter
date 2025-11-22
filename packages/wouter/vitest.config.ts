import { defineProject } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineProject({
  plugins: [react({ jsxRuntime: "automatic" })],
  resolve: {
    alias: {
      "wouter-preact": resolve(__dirname, "../wouter-preact/esm/index.js"),
    },
  },
  test: {
    name: "wouter-react",
    globals: true,
    setupFiles: "./setup-vitest.ts",
    environment: "happy-dom",
  },
});
