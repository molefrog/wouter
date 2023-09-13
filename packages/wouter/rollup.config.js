import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: ["src/react-deps.js"],
    output: {
      dir: "esm",
      format: "esm",
    },
    external: [
      "react",
      "use-sync-external-store/shim/index.js",
      "use-sync-external-store/shim/index.native.js",
    ],
  },
  {
    input: ["src/index.js", "src/static-location.js", "src/use-location.js"],
    external: [/react-deps/],
    output: {
      dir: "esm",
      format: "esm",
    },
  },
]);
