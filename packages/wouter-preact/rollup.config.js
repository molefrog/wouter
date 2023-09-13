import alias from "@rollup/plugin-alias";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: ["wouter", "wouter/static-location", "wouter/use-location"],
    external: ["preact", "preact/hooks"],

    output: {
      dir: "esm",
      format: "esm",
    },
    plugins: [
      nodeResolve(),
      alias({
        entries: {
          "./react-deps.js": "./src/preact-deps.js",
        },
      }),
    ],
  },
]);
