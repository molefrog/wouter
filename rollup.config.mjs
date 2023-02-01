// support for preact builds
const isPreact = String(process.env.DIR).indexOf("preact") !== -1;

if (isPreact) process.chdir("./preact");

const ESM_SOURCES = [
  "index.js",
  "matcher.js",
  "react-deps.js",
  "use-location.js",
  ...(isPreact
    ? []
    : // only included in React build
      ["use-sync-external-store.js", "use-sync-external-store.native.js"]),
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
