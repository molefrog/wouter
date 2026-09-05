import { resolve } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

// Use the same dependencies and Bun version for both source trees. An optional
// second path points at a separate dependency installation for historical code.
// Unlike size-limit, this includes compatibility dependencies and reports ESM
// output without subtracting bundler overhead. The two metrics are distinct.
const checkoutRoot = resolve(import.meta.dir, "..");
const sourceRoot = resolve(process.argv[2] || checkoutRoot);
const dependencyRoot = resolve(process.argv[3] || checkoutRoot);
const entries = [
  { file: "index.js", exports: "*" },
  { file: "use-browser-location.js", exports: "{ useBrowserLocation }" },
  { file: "memory-location.js", exports: "*" },
  { file: "use-hash-location.js", exports: "*" },
];

const results = [];
for (const framework of ["react", "preact"]) {
  const external =
    framework === "react" ? ["react"] : ["preact", "preact/hooks"];

  for (const entry of entries) {
    const sourcePath = resolve(sourceRoot, "packages/wouter/src", entry.file);
    const build = await Bun.build({
      entrypoints: ["wouter-size:entry"],
      target: "browser",
      format: "esm",
      minify: true,
      sourcemap: "none",
      define: { "process.env.NODE_ENV": '"production"' },
      plugins: [
        {
          name: "measure-shared-source",
          setup(builder) {
            builder.onResolve({ filter: /^wouter-size:/ }, () => ({
              path: "entry",
              namespace: "wouter-size",
            }));
            builder.onLoad({ filter: /.*/, namespace: "wouter-size" }, () => ({
              contents: `export ${entry.exports} from ${JSON.stringify(
                sourcePath
              )};`,
              loader: "js",
            }));

            // Preact publishes the shared React sources with this one adapter
            // replaced. Resolve it directly, so tests can copy/delete generated
            // Preact files without changing the measurement.
            if (framework === "preact") {
              builder.onResolve({ filter: /^\.\/react-deps\.js$/ }, () => ({
                path: resolve(
                  sourceRoot,
                  "packages/wouter-preact/src/react-deps.js"
                ),
              }));
            }

            builder.onResolve({ filter: /^[^./]/ }, ({ path }) => {
              // Exact matches matter: Bun's external: ["preact"] also excludes
              // preact/compat, concealing its cost if the adapter imports it.
              if (external.includes(path)) return { path, external: true };
              return { path: Bun.resolveSync(path, dependencyRoot) };
            });
          },
        },
      ],
    });

    if (!build.success) throw new AggregateError(build.logs, "Bundle failed");
    if (build.outputs.length !== 1) throw new Error("Expected one ESM bundle");
    const bytes = new Uint8Array(await build.outputs[0].arrayBuffer());
    results.push({
      package: framework === "react" ? "wouter" : "wouter-preact",
      entry: entry.file,
      exports: entry.exports,
      external,
      raw: bytes.byteLength,
      gzip: gzipSync(bytes, { level: 9 }).byteLength,
      brotli: brotliCompressSync(bytes, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      }).byteLength,
    });
  }
}

const dependencyVersion = async (name: string) => {
  try {
    const path = Bun.resolveSync(`${name}/package.json`, dependencyRoot);
    return (await Bun.file(path).json()).version;
  } catch {
    return null;
  }
};

console.log(
  JSON.stringify(
    {
      metric: "Bun minified production ESM, dependency-inclusive, bytes",
      bun: Bun.version,
      sourceRoot,
      dependencyRoot,
      compression: { gzipLevel: 9, brotliQuality: 11 },
      dependencies: {
        regexparam: await dependencyVersion("regexparam"),
        preact: await dependencyVersion("preact"),
        "use-sync-external-store": await dependencyVersion(
          "use-sync-external-store"
        ),
      },
      results,
    },
    null,
    2
  )
);
