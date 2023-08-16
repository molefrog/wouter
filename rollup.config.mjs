import replace from "@rollup/plugin-replace";
import { defineConfig } from "rollup";

// support for preact builds
const isPreact = String(process.env.DIR).indexOf("preact") !== -1;

if (isPreact) process.chdir("./preact");

const ESM_SOURCES = [
  "index.js",
  "matcher.js",
  "react-deps.js",
  "use-location.js",
  "use-params.js",
  "static-location.js",
  ...(isPreact
    ? []
    : // only included in React build
      ["use-sync-external-store.js", "use-sync-external-store.native.js"]),
];

const OUTPUT_DIR = "cjs";

export default defineConfig([
  {
    input: ESM_SOURCES,
    external: [
      "react",
      "preact",
      "preact/hooks",
      "use-sync-external-store/shim/index.js",
      "use-sync-external-store/shim/index.native.js",
      // tell Rollup not to apply any optimizations to unqualified `use-sync-external-store`
      // import (see comment below)
      "./use-sync-external-store",
    ],
    output: {
      dir: OUTPUT_DIR,
      format: "cjs",
      exports: "named",
    },
    plugins: [
      replace({
        // replaces qualified import with an unqualified one
        // so that React Native's bundler can pick up the right source file
        // See https://github.com/molefrog/wouter/pull/277#issuecomment-1382930657
        "./use-sync-external-store.js": "./use-sync-external-store",
        preventAssignment: true,
        delimiters: ["", ""],
      }),
    ],
  },
]);
