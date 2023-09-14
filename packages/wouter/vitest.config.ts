import { defineProject } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineProject({
  plugins: [react({ jsxRuntime: "automatic" })],
  test: {
    name: "wouter-react",
    environment: "jsdom",
    typecheck: {
      // TODO: remove this option when all types will moved to the new tooling
      ignoreSourceErrors: true,
    },
  },
});
