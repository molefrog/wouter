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
    input: [
      "src/index.js",
      "src/use-browser-location.js",
      "src/use-hash-location.js",
      "src/memory-location.js",
    ],
    external: [/react-deps/, "regexparam", "mitt"],
    output: {
      dir: "esm",
      format: "esm",
    },
  },
]);
