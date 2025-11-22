import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Define projects using glob patterns
    projects: ["packages/*"],
    // Coverage must be defined at root level, not in individual projects
    coverage: {
      include: [
        "packages/wouter/src/**/*.{js,jsx,ts,tsx}",
        "packages/wouter-preact/src/**/*.{js,jsx,ts,tsx}",
      ],
    },
  },
});
