# Working on Wouter

This is the shared project guide for coding agents. Keep it
focused on durable conventions; use the source, package scripts, and CI workflows
for details that change frequently.

## Project and layout

Wouter is a small, hook-based router for React and Preact. Prioritize a small
bundle, few dependencies, stable references, and predictable routing behavior.
`regexparam` is a runtime dependency; this is not a zero-dependency project.

- `packages/wouter/src/`: canonical JavaScript implementation, shipped directly
  as ES modules. The root `build` script is a no-op; there is no required `esm/`
  build output.
- `packages/wouter-preact/`: shares Wouter's runtime sources except for its own
  `src/react-deps.js` adapter. Shared files are copied by `prepublishOnly` and
  ignored by Git. Edit the canonical sources instead of the generated copies.
- `packages/*/types/`: hand-maintained TypeScript declarations. Keep React and
  Preact declarations aligned while preserving framework-specific types. Wouter's
  `src/*.d.ts` files forward to these declarations for source imports.
- `packages/*/test/`: runtime tests and declaration tests (`*.test-d.ts[x]`).
- `packages/magazin/`: private storefront demo using Bun, React, SSR, and Tailwind.
- `README.md`: canonical public documentation; package READMEs are copied from it.
  [specs/browser-support.md](specs/browser-support.md) records the Wouter 4
  compatibility decisions and their rationale.

## Tooling and checks

Use Bun for installation, scripts, tests, and builds. Keep the single root
`bun.lock`; do not introduce nested lockfiles or a second package manager.
Prefer Bun's built-in APIs (`Bun.file`, `Bun.serve`, `Bun.build`, `Bun.$`) for
new tooling. Bun loads `.env` automatically. Demo frontend work uses Bun's HTML
entrypoints rather than Vite.

Run commands from the repository root unless specified otherwise:

```sh
bun install                         # CI uses --frozen-lockfile
bun test                            # React, Preact, and demo runtime tests
bun test --watch
bun test packages/wouter/test/router.test.tsx
bun test --coverage
bun run test-types                  # library code and declaration tests
bun run test-types:consumer         # strict public API checks, three resolution modes
bun run lint
```

The root `bunfig.toml` preloads Happy DOM, jest-dom matchers, and cleanup. Follow
the existing `bun:test` and Testing Library patterns; use `memoryLocation` for
isolated routing tests. CI requires 99% line coverage for the libraries. Demo
code and generated Preact source copies are excluded from that coverage metric.

Preact tests create and then delete the shared source copies. Refresh them
**after tests**, before size checks or packaging; do not run these operations
concurrently with the tests:

```sh
bun run --cwd packages/wouter-preact prepublishOnly
bun run size
bun run size:dependencies
```

`size` enforces the budgets in `package.json`. `size:dependencies` reports raw,
gzip, and Brotli sizes including non-peer dependencies; these are different
measurements. Compare equivalent sources with the same tooling and dependencies.
Do not raise budgets just to make a regression pass.

Keep changes compact and consistent with nearby code: two spaces, double quotes,
and semicolons. Format changed files with the installed Prettier. The `fix:p`
script rewrites JavaScript and TypeScript across the repository, so use it only
when that scope is intended. Run checks appropriate to the change; public API
changes need runtime coverage, declarations for both frameworks, and README
updates. Documentation-only changes do not require the full runtime suite.

## Compatibility and routing constraints

Current development prepares Wouter 4: React **18.2+**, Preact **10.x**, and
TypeScript **5.2+**. Published source targets **ES2022** with fixed browser floors
in `.browserslistrc`. Keep published modules synchronously initialized, without
top-level await. There is no transpilation or automatic polyfill step.

- Preserve stable router, parameter, and navigation callback references. Parameter
  caching must distinguish missing keys from keys whose value is `undefined`.
- Keep the React 18 store snapshot workaround and the small Preact adapter unless
  compatibility tests justify changing them. `useEffectEvent` cannot replace
  callbacks used by click/navigation handlers. Keep React 18 `forwardRef` support.
- Routing changes should cover nested/base paths, absolute `~/` paths, search
  updates, and SSR/hydration. Preserve explicit empty search values and browser-free
  SSR imports. Keep History API patching idempotent and subscriber notifications
  grouped so parent and child routing updates stay consistent.
- `aroundNav` wraps navigation through `useLocation`, `Link`, and `Redirect`.
  Browser Back/Forward, direct History API calls, and low-level `navigate` bypass
  it. View transitions remain an application integration; do not add `react-dom`
  to the library for them.
- Preserve strict consumer checks under bundler, NodeNext, and legacy node
  resolution, including optional properties and unchecked indexed access.
  Custom hook types require explicit type arguments; child components cannot
  infer them automatically from router context.

## Magazin demo

Run `bun run --cwd packages/magazin dev` (port 3002 by default; `PORT` overrides
it). Use `bun run --cwd packages/magazin prod` for production mode. The root
library type check excludes the demo; check it separately with
`bun x --no-install tsc -p packages/magazin/tsconfig.json --noEmit`.

Preserve the recent demo fixes: cart actions update shared state, counts and
totals include quantities, missing products set HTTP 404 through `ssrContext`,
and navigation/filter/sort controls expose accessible names and state. Display
the Wouter version from package metadata. Regression tests live alongside the
demo; its React/Helmet requirements do not set the library's compatibility floor.

## Releases

Keep `wouter` and `wouter-preact` versions in sync, using semantic versioning.
Read their manifests for the current version and exports. Both publish `src/`
and declaration files; Magazin is private and must not be published.

Before a release, run the relevant tests, type checks, lint, and size checks.
Prepare both packages and inspect the dry-run contents, versions, and exports:

```sh
bun run --cwd packages/wouter prepublishOnly
bun run --cwd packages/wouter-preact prepublishOnly
bun publish --cwd packages/wouter --dry-run
bun publish --cwd packages/wouter-preact --dry-run
```

Publishing, release commits/tags, and pushes require explicit user authorization.
If it is not already given, finish preparation and ask before those steps. Use
the intended registry dist-tag explicitly (`next` for the current prerelease
series); do not accidentally publish a prerelease under `latest`.

Publish both packages with the same version and dist-tag, using registry
credentials with access to both. Verify each registry version and tag afterward.
If authentication or OTP reports an ambiguous failure, check registry state
before retrying; an error alone does not prove success or failure. Create the
`vX.X.X` release tag and push the intended branch/tag within the authorized scope;
do not assume the release branch is `main`.
