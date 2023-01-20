import glob from "glob";

// support for preact builds
if (process.env.DIR) process.chdir(process.env.DIR);

const ESM_SOURCES = [
  "index.js",
  "matcher.js",
  "react-deps.js",
  "use-location.js",
  "use-sync-external-store.js",
  "use-sync-external-store.native.js",
  "static-location.js",
];

const OUTPUT_DIR = "cjs";

export default [
  {
    input: ESM_SOURCES,
    external: [
      "react",
      "preact",
      "preact/hooks",
      "use-sync-external-store/shim/index.js",
      "use-sync-external-store/shim/index.native.js",
    ],
    output: {
      dir: OUTPUT_DIR,
      format: "cjs",
      preserveModules: true,
      exports: "named",
    },
  },
  {
    // TODO: migrate `static-location` to ESM object exports
    input: "static-location.js",
    output: {
      dir: OUTPUT_DIR,
      format: "cjs",
      exports: "auto",
    },
  },
];
