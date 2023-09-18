import { defineProject } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineProject({
  plugins: [preact()],
  test: {
    name: "wouter-preact",
    environment: "jsdom",
    typecheck: {
      // TODO: remove this option when all types will moved to the new tooling
      ignoreSourceErrors: true,
    },
  },
});
