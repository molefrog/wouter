import { defineProject } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineProject({
  plugins: [preact()],
  test: {
    name: "wouter-preact",
    globals: true,
    environment: "happy-dom",
    setupFiles: "./setup-vitest.ts",
  },
});
