# Browser support for Wouter 4

Audit date: **2026-09-05**. Source baseline: `d3711ad` (Wouter 3.10.0).
This change prepares **4.0.0-next.0**; it does not publish a release.

## Decision

**Raise the JavaScript source target from ES2020 to ES2022.** Use features
supported by the fixed browser baseline below. Router defaults now use `??=`
(ES2021). Parameter caching uses `Object.hasOwn()` (ES2022) to distinguish a
missing key from an optional parameter whose value is `undefined`, so renaming
optional parameters updates the cached keys correctly. `.at()` is available
for future edits but has no useful substitution in the current implementation.
The React compatibility cleanup accounts for most of the bundle reduction.
Removing the `Object.is` polyfill and `HashChangeEvent` fallback was already
safe within the previous browser target.

| Browser family | Minimum |
| --- | ---: |
| Chrome, Edge, Chrome Android, Android WebView | 94 |
| Firefox, Firefox Android | 93 |
| Safari, iOS/iPadOS Safari | 16.4 |
| Opera | 80 |
| Opera Android | 66 |
| Samsung Internet | 17 |

Keep these minimums fixed throughout Wouter 4. ES2022 static class blocks
determine the main engine floors; the target covers the other ordinary ES2022
syntax and APIs, with the top-level-await exception below. The root
`.browserslistrc` records the policy for tools that read Browserslist; Wouter
itself ships source and has no compilation step. A Browserslist file neither
transpiles code nor supplies missing APIs.
Browserslist datasets enumerate only current Chrome/Firefox Android versions;
the historical Android floors here come from API data, not from that resolver.

Require **React 18.2+** and retain **Preact 10+**. Framework support is a
separate decision from browser support. React 18 supplies native
`useSyncExternalStore` and `useInsertionEffect`, allowing removal of the
external-store shim dependency, its two resolver files, and old missing-export
fallbacks. The 18.2 patch baseline incorporates hydration, Suspense, and Safari
fixes; the hooks themselves arrived in 18.0. React 18.3 adds no API that lets
Wouter remove more code.

Keep `forwardRef` for `Link` and the small server-safe layout-effect adapter.
These are still needed on React 18. The measured React 19-only candidate saved
only about 60 additional bytes gzip, while excluding every React 18 app.
A small wrapper around the native store hook fixes React 18's render-phase
snapshot regression without restoring the external shim. React 19 remains
supported, and applications do not need to adopt its ref-prop semantics.

Require TypeScript 5.2+ for typed consumers, replacing the previous 4.1 floor.
The improved declarations work with both React 18 and React 19 type definitions;
use the declarations matching the application's React major version. The
TypeScript floor is independent of the React runtime floor.

ES2022 is an authoring target, not a claim of exhaustive standards conformance.
Published modules must retain synchronous initialization: Safari has a known
[top-level-await module-dependency bug](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/operators/await.json)
within this range. Wouter does not use top-level await. Browser versions below
the table, IE11, and legacy Edge are outside this policy. Webviews must supply
the same capabilities; Baseline does not independently certify embedded webviews.

## What the previous version targeted

The README advertised **ES2020+**, with consumer transpilation for older
browsers. It did not name minimum browser versions or guarantee runtime
polyfills. Both package export maps point directly to `src/*.js`; the root
`build` script is a no-op. `tsconfig.json` is used for no-emit typechecking,
not browser output. Neither old generated `esm/` files nor the
size-check bundler establishes a supported browser range.

Earlier documentation mentioned IE11 with Babel transpilation and an `Event`
polyfill. Commit `e02333f` replaced that guidance with ES2019 in January 2024;
`6abe383` corrected the wording to ES2020 in June 2024. Wouter 4 now raises that
existing modern-browser target to ES2022; this is not a fresh transition from
native IE11 support.
Applications that transpile for older engines remain responsible for the
required browser APIs, including the two whose fallbacks are removed here.

The package peers were React `>=16.8.0` and Preact `^10.0.0`. The ordinary test
installation used React 19.2.0 and Preact 10.26.6, rather than a minimum-version
matrix.

## Feature map

Versions below are from [MDN browser-compat-data 8.1.0](https://github.com/mdn/browser-compat-data/tree/v8.1.0),
published September 3, 2026. Rows link to the pinned primary data. These are
capability requirements, not claims that historical browser binaries were run.
Chrome, Edge, Firefox, and Safari columns give desktop introduction versions;
Android introduction versions can differ. The selected Chrome Android 94 /
Firefox Android 93 floors cover all listed features. Rows marked as available
for future edits describe allowed features that the current source does not use.

| Feature | Used for | Chrome | Edge | Firefox | Safari | iOS Safari |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| [ES modules](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/statements.json) | Every published entry | 61 | 16 | 60 | 10.1 | 10.3 |
| [Object spread/rest](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/operators/spread.json) | Router options, params, props | 60 | 79 | 55 | 11.1 | 11.3 |
| [Optional chaining](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/operators/optional_chaining.json) | Hooks, callbacks, link classes | 80 | 80 | 74 | 13.1 | 13.4 |
| [Nullish coalescing](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/operators/nullish_coalescing.json) | Router inheritance and SSR defaults | 80 | 80 | 72 | 13.1 | 13.4 |
| [Nullish assignment (ES2021)](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/operators/nullish_coalescing_assignment.json) | Router hook defaults (`??=`) | 85 | 85 | 79 | 14 | 14 |
| [Named RegExp captures](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/regular_expressions.json) | User-supplied RegExp routes | 64 | 79 | 78 / Android 79 | 11.1 | 11.3 |
| [Symbol.for](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/builtins/Symbol.json) | Deduplicate History API patch | 40 | 12 | 36 | 9 | 9 |
| [URL constructor](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/URL.json) | Hash navigation URL updates | 19 | 12 | 26 | 6 | 6 |
| [URLSearchParams constructor](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/URLSearchParams.json) | Search params hook | 49 | 17 | 29 | 10.1 | 10.3 |
| URLSearchParams object input | `setSearchParams({ key: value })` | 61 | 17 | 54 | 11 | 11 |
| URLSearchParams sequence input | `setSearchParams([[key, value]])` | 58 | 17 | 53 | 11 | 11 |
| [Event constructor](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/Event.json) | Synthetic History API notifications | 15 | 12 | 11 | 6 | 6 |
| [HashChangeEvent constructor](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/HashChangeEvent.json) | Hash notifications, including old/new URLs | 16 | 12 | 11 | 6 | 6 |
| [Object.is](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/builtins/Object.json) | Preact snapshot comparisons | 19 | 12 | 22 | 9 | 9 |
| [Array/String `.at()`](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/builtins/Array.json) | Available for future edits | 92 | 92 | 90 | 15.4 | 15.4 |
| [Object.hasOwn](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/builtins/Object.json) | Check keys when caching matched parameters | 93 | 93 | 92 | 15.4 | 15.4 |
| [Static class blocks](https://github.com/mdn/browser-compat-data/blob/v8.1.0/javascript/classes.json) | Sets the broader ES2022 floor; currently unused | 94 | 94 | 93 | 16.4 | 16.4 |

History `pushState`/`replaceState`/`state`, `popstate`, `hashchange`, event
listeners, `Object.assign`/`keys`/`defineProperty`, `Array.isArray` and ordinary
array methods, string `includes`, and `decodeURI` also remain required. They
predate the chosen floor. Frameworks and application code can have additional
requirements.

### Web standards

ES2022 specifies JavaScript syntax and built-ins; it does not define browser
APIs. Wouter also requires the URL standard (`URL`, `URLSearchParams`), HTML
history/location APIs, and DOM events. The uses listed above are supported
throughout the fixed browser range, so they do not raise its minimum versions.

The browser-level cleanup in this change is using native `HashChangeEvent`
directly, removing the generic-event fallback while preserving `oldURL` and
`newURL`. This API was already available within the old target. The other
URL, History, and event APIs were already used natively; the ES2022 upgrade
does not newly enable them.

Keep the History API patch: `pushState` and `replaceState` do not produce the
notifications Wouter needs. Even changing a fragment through `pushState`
[does not fire `hashchange`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState).
The Navigation API could enable a different design, but exceeds the chosen
browser range and requires a separate behavior audit.

## Estimated browser coverage

Using **August 2026** global usage, checked on **2026-09-05**, the fixed ES2022
query covers approximately **94.19%**. The previous source's required features
cover **94.77%** with the same browser families and dataset: a reduction of
**0.58 percentage points**. The narrower `.at()` + `Object.hasOwn()` combination
alone would cover 94.64%; that is not the coverage of this broader ES2022 target.

Calculated with Browserslist **4.28.9**, caniuse-lite **1.0.30001810**, and browser
minima from MDN browser-compat-data **8.1.0**. To refresh the current policy's
estimate from the repository root:

```sh
bun x browserslist@latest --coverage
```

[Can I Use's usage data](https://caniuse.com/usage-table) comes from StatCounter
and extrapolates some mobile versions. Approximately **4.10%** is unclassified
in this dataset; do not count all of the remaining 5.81% as known incompatible
traffic. Some Android families group usage under a single current version,
so this is an estimate rather than evidence about every installed mobile
browser. Check application analytics with
[Browserslist custom usage data](https://github.com/browserslist/browserslist#custom-usage-data)
for an audience-specific decision. Future dataset updates change percentages,
not Wouter 4's fixed minimum versions.

## Alternatives and why they were not adopted

[Baseline Widely available](https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md)
requires interoperability across the core browser set for at least 30 months
and accounts for Firefox ESR. It moves over time. A library should freeze a
date or explicit versions, rather than silently drop browsers in minor releases.

Frozen on this audit date, the stronger alternative is Chrome/Edge 121,
Firefox 123, and Safari/iOS 17.4, including their corresponding Android engines.
This was derived from `web-features@3.37.0` and the
[WebDX mapping timeline](https://github.com/web-platform-dx/baseline-browser-mapping/blob/v2.11.21/src/data/timeline.js).
Safari 17.4 reaches its 30-month boundary on September 5, 2026. That stronger
floor excludes more users without enabling further worthwhile deletions here.

| Candidate | Decision and reason |
| --- | --- |
| Native `HashChangeEvent` | Adopt. Its constructor is much older than the floor. Remove the fallback, retaining URL payloads and synchronous notification. |
| Native `Object.is` | Adopt for Preact. Removes an obsolete browser polyfill while preserving NaN and signed-zero semantics. |
| ES2021 `??=` | Adopt for the two Router hook defaults. Preserves nullish fallback behavior and saves a few bytes. |
| ES2022 `Object.hasOwn()` | Adopt in the parameter cache. Comparing values alone misses renamed optional parameters when both values are `undefined`; also check that each key exists. |
| ES2022 `.at()` | Allowed by the new target. No current last-element reads benefit from replacement; memory history needs indexed assignment. |
| React's native store/insertion hooks | Adopt. Remove the dependency, two shim resolver files, and missing-export/fallback machinery. |
| Native `preact/compat` store hook | Reject. It ignores the server snapshot argument and imports unrelated compatibility code. With an SSR wrapper, the measured core adds 3,986 bytes gzip when core/hooks are external. Keep Preact 10 support. |
| Listener cleanup with `AbortController` / `{ signal }` | Supported within the floor (Chrome 90, Firefox 86, Safari 15), but keeps the subscriber bookkeeping and adds a controller lifecycle. Retain the simpler explicit cleanup. |
| `queueMicrotask` notifications | Supported within the floor, but defers notifications that currently run synchronously. It is not a replacement for the current batching behavior. |
| `EventTarget` for internal subscriptions | Supported within the floor, but adds event objects, changes listener-removal and exception behavior, and adds a browser API dependency to the portable memory store. Keep the small subscriber arrays. |
| `URLSearchParams.size` | Requires Chrome 113, Firefox 112, Safari 17. Keep the existing serialized-string emptiness check: the string is needed for navigation anyway. |
| `URL.canParse()` | Requires Chrome 120, Firefox 115, Safari 17. Current URL construction uses valid `location.href`, so this removes no validation code. |
| `Array.flat`/`flatMap` | Already available within the floor, but array flattening alone does not implement React/Preact fragment traversal. Retain the allocation-conscious recursive helper. |
| `Object.fromEntries` | Already available within the floor, but rebuilding route params through mapped entry arrays adds allocations; current loops preserve numeric, duplicate, and named capture precedence. |
| Native `URLPattern` | Reject as a required parser. Support is newer, its pattern semantics differ, and it cannot replace custom parsers and supplied RegExp objects transparently. |
| Navigation API replacing History patch | Reject. New interoperability does not make it widely available or preserve Wouter's existing event/interception semantics. |
| `RegExp.escape` | Not needed by current implementation; do not add a new minimum just to introduce it. |
| Unconditional view transitions | Reject. Keep the optional `aroundNav` recipe and its feature check. |
| React `useEffectEvent` replacing `useEvent` | Reject. It is for Effect logic, not stable callbacks passed to components and called from click/navigation handlers. |
| React 19-only ref props | Defer. Retain `forwardRef` so React 18 applications keep ordinary and `asChild` refs. The measured React 19-only candidate saved only about 60 additional bytes gzip. |
| React's server-safe layout-effect adapter | Retain. React 18 warns about layout effects during SSR; `Redirect` still needs layout timing in the browser. |
| Preact 11 | Defer while it is a release candidate. Its store hook still lives in compat, and its type changes would require a separate migration. Stable 10.29.8 provides no smaller public store hook. |
| Other DOM/SSR guards or URI decoding catch | Retain. Preact still needs server snapshot selection, browser hooks need safe imports without browser globals, and malformed percent escapes still occur on current browsers. |
| Remove listener batching or patch deduplication | Reject. Native events can allow microtasks between listeners; multiple installed Wouter copies still share the History API. Keep the `wouter_v3` symbol to avoid double-patching mixed-major applications. |
| Mark whole packages side-effect-free | Reject without a separate design: importing browser routing installs the History patch. |

Additional Web API support data:
[event listener options](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/EventTarget.json),
[URLSearchParams](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/URLSearchParams.json),
[URL](https://github.com/mdn/browser-compat-data/blob/v8.1.0/api/URL.json).
Behavior references:
[DOM event dispatch](https://dom.spec.whatwg.org/#concept-event-listener-invoke),
[HTML microtask queuing](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#microtask-queuing).

These candidates are not Baseline Widely available on the audit date:

| Basic API | Chrome/Edge | Firefox | Safari/iOS | Newly interoperable |
| --- | ---: | ---: | ---: | --- |
| [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) | 102 | 147 | 26.2 | January 2026 |
| [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) | 95 | 142 | 26 | September 2025 |
| [startViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) | 111 | 144 | 18 | October 2025 |
| [RegExp.escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape) | 136 | 134 | 18.2 | May 2025 |

React hook rationale: [React 18 native hooks](https://react.dev/blog/2022/03/29/react-v18),
[React 18.2 fixes](https://github.com/facebook/react/releases/tag/v18.2.0),
[React 18.3 upgrade warnings](https://react.dev/blog/2024/04/25/react-19-upgrade-guide),
[React 19 ref props](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop),
[removal of the server layout-effect warning](https://github.com/facebook/react/pull/26395),
[useEffectEvent restrictions](https://react.dev/reference/react/useEffectEvent).

## Size evidence

Compared against v3.11.0 using Bun 1.4.0, regexparam 3.0.0, Preact 10.26.6, and
the baseline's use-sync-external-store 1.5.0. `bun scripts/measure-size.ts` bundles
production ESM using Bun, retains all exports except where indicated, includes non-peer
dependencies, and measures gzip level 9 / Brotli quality 11. Exactly `react`,
or `preact` and `preact/hooks`, are external. Broadly excluding `preact/*`
would conceal the cost of the rejected compat import.

| Entry | Before gzip | After gzip | Saved | Before Brotli | After Brotli |
| --- | ---: | ---: | ---: | ---: | ---: |
| React core | 2,641 | 2,388 | 253 (9.6%) | 2,380 | 2,141 |
| React `useBrowserLocation` only | 878 | 621 | 257 (29.3%) | 771 | 535 |
| React memory | 859 | 601 | 258 (30.0%) | 767 | 545 |
| React hash | 871 | 580 | 291 (33.4%) | 762 | 507 |
| Preact core | 2,510 | 2,482 | 28 (1.1%) | 2,253 | 2,228 |
| Preact `useBrowserLocation` only | 756 | 715 | 41 (5.4%) | 653 | 621 |
| Preact memory | 737 | 694 | 43 (5.8%) | 653 | 622 |
| Preact hash | 739 | 680 | 59 (8.0%) | 647 | 596 |

These entries overlap; do not add their savings together. Framework code is
excluded, so an application's percentage saving depends on its own bundle.

The existing `bun run size` is a separate esbuild/Brotli metric with bundler
overhead adjustments. Its original React checks also excluded the store shim.
Its core result improves from 2,341 to 2,131 bytes for React and 2,230 to 2,227
for Preact. Its limits are tightened in this change. Do not label this metric
gzip or compare it directly to the Bun table.

For a source-revision comparison, run the same script/Bun/dependencies on both
trees. The optional second directory supplies a separate dependency installation
so a fresh checkout can still measure historical code that requires the removed
shim:

```sh
baseline_dir=$(mktemp -d)
git archive v3.11.0 | tar -x -C "$baseline_dir"
deps_dir=$(mktemp -d)
bun add --cwd "$deps_dir" regexparam@3.0.0 preact@10.26.6 use-sync-external-store@1.5.0
bun scripts/measure-size.ts "$baseline_dir" "$deps_dir"
bun scripts/measure-size.ts . "$deps_dir"
```

## Migration and validation

- Target ES2022 browsers using the fixed versions above. Published source now
  includes `??=`; older engines may need consumer-side transpilation as well
  as runtime polyfills and are outside Wouter 4's supported range.
- React 18.2+ applications can adopt Wouter 4 without upgrading to React 19.
  React 16/17 applications need React 18.2+ or should stay on Wouter 3.x.
  Preact users keep using the separate `wouter-preact` package with Preact 10+.
- Upgrade TypeScript to 5.2+ and use types matching the React major. Preact's
  memory-location types now include the existing runtime's search options and
  search hook, matching the React package.
- Remove app-level event/Object.is polyfills only if the rest of the app and
  its dependencies do not need them. Wouter removing a fallback does not make
  an application-wide polyfill automatically redundant.
- Keep feature detection in view-transition integrations. The core does not
  require Navigation API, URLPattern, or view transitions.
- Test server rendering and hydration after upgrading the framework. Native
  React hooks preserve server snapshots; no `.native.js` shim resolver is
  needed. This does not turn browser location hooks into native navigation.

Run checks in this order: the Preact tests create and then remove their shared
source copies, so regenerate them before package checks or the existing size
command. The Bun measurement script resolves shared sources directly.

```sh
bun install --frozen-lockfile
bun test --coverage --coverage-reporter=text
bun run test-types
bun run --cwd packages/wouter-preact prepublishOnly
bun run lint
bun run size
bun run size:dependencies
```

The revised implementation passes all **251 tests** on the existing React
19.2.0 installation, with Preact 10.26.6 and **100% source line coverage**.
The React compatibility changes were also checked on React 18.3.1.
The Preact SSR test and the new React
SSR test run in separate Bun processes without browser globals. They verify
server path/query/hash snapshots; the React check also covers `Link`, redirect
context, and the absence of server warnings. Snapshot tests cover repeated NaN
and signed-zero changes. Ordinary and `asChild` ref tests check mounting and
null callbacks on unmount, which work on both React 18 and React 19.

The optional-parameter cache regression changes `/:first?` to `/:second?` at
`/`, checking that the keys update even though both values are `undefined`.
It failed before the `Object.hasOwn()` fix and now passes on React 19.2.0 and
the exact React 18.2.0 minimum. The existing test for unchanged parameter object
identity also passes. This correctness fix adds 12 bytes gzip to each core.

React 18's [render-phase store bug](https://github.com/facebook/react/pull/25578)
can leave a snapshot stale when revisiting an earlier value after a render-phase
state update. The native-store adapter supplies a fresh snapshot getter on each
render, causing React to refresh its committed store cache while keeping the
subscription stable. The regression test stays enabled and passes on 18.2.0,
18.3.1, and 19.0.0;
raising the framework floor to 19 is no longer necessary to fix it.

Fresh, isolated installs of exact React/ReactDOM **18.2.0**, **18.3.1**, and
**19.0.0** each pass all **245 React tests**, including the DOM-less SSR fixture
with no stderr and the memory pathname/query regressions inherited from v3.11.0.
A packed Wouter consumer on React 18.2.0 also passes public-entry imports,
memory navigation, hash formatting, browser/hash SSR, links, redirect context,
and strict TypeScript 5.2.2 NodeNext checks with invalid-state rejection.

CI covers the exact React 18.2.0 floor, React 18.3.1, and React 19.0.0 separately
from the repository's existing development/demo React 19 installation. The
private SSR demo already uses a React 19-only Helmet package, so its existing
runtime is retained; it does not set the library's peer requirement.

Type tests live in `packages/*/test/*.test-d.ts` and `*.test-d.tsx`; the main
`bun run test-types` command checks them through the root ES2022 configuration.
The `public-api.test-d.tsx` and `public-subpaths.test-d.ts` files in those same
directories also run through `tsconfig.consumer.json`, without Bun test types,
to check all public entry points with React 18 and React 19 declarations under
TypeScript 5.2.2 and the workspace compiler. All 12 combinations of compiler,
React declarations, and bundler/NodeNext/legacy node resolution pass.
CI runs this matrix with `skipLibCheck: false`,
`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and
`verbatimModuleSyntax`. It verifies route inference, navigation options,
callback-ref element/null typing, and invalid prop/state rejection.

The consumer configuration intentionally omits Bun's declarations: the test
runner's current types require a newer compiler than the library's TypeScript
5.2 minimum. All type assertions still follow the existing package test layout.

### Declaration improvements for the major release

- Route literal inference now matches the default parser for `"*"` captures,
  filename suffixes, repeated parameter names, and colons in literal segments.
  Repeated names use the last capture, including an absent optional capture.
  Dynamic string routes allow named lookups as `string | undefined`.
- Parameter interfaces work without an index signature. Explicit parameter
  types remain caller assertions; neither string literals nor TypeScript can
  prove the behavior of a custom parser or infer a parent route from context.
- Loose `matchRoute` calls expose their third tuple entry, the matched base.
  The optional missing-base slot supports destructuring on TypeScript 5.2.
- Memory hooks retain their navigation state type through `useLocation`,
  `Link`, `Redirect`, and the now-generic `useSearchParams`. Dynamic `record`
  flags produce optional history/reset fields. Search setters also accept
  readonly entry tuples and preserve required or nullable custom options.
- The router argument to `hrefs` is typed. Parsers can return readonly keys,
  `false`, or omit keys to use regular-expression named captures. Hash hooks
  expose their attached `hrefs` formatter, and `useLocationProperty` accepts
  stable object snapshots as well as primitives.

Type-only migration notes: replace the formerly inferred `params.wild` with
`params["*"]`; access `params.file` for `/:file.txt`; handle possibly missing
values for repeated optional names. `RouterObject.ownBase` was removed because
it does not exist at runtime; use `base`. Custom `hrefs` callbacks receive the
router as their second argument, so direct calls to a value typed as
`HrefsFormatter` must supply it. Invalid primitive `useParams` type arguments
and incorrect memory navigation state now produce errors. These declaration
changes add no runtime code or bundle bytes.

Happy DOM and Bun do not prove historical browser support. Browser minimums
above are derived from the pinned feature data; running current browser engines
is additional behavioral evidence, not a substitute for testing those old
binary versions. The global usage estimate above is not a test result or a
guarantee of coverage for any application's audience.
