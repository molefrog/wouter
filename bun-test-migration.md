# Bun Test Migration Guide

Tips, caveats, and context for migrating from Vitest to Bun test.

## API Differences to Watch For

### Test Framework APIs

Bun test uses Jest-compatible APIs with some naming differences from Vitest:

- `it()` is called `test()` in Bun
- `vi.fn()` becomes `mock()`
- Matcher methods: `toBeCalled*` → `toHaveBeenCalled*` (e.g., `toBeCalledTimes` → `toHaveBeenCalledTimes`)

Import source changes from `"vitest"` to `"bun:test"`.

### Module Import Pattern

Use **relative imports** to import from source files:

```typescript
import { useSearch, Router } from "../src/index.js";
import { navigate } from "../src/use-browser-location.js";
import { memoryLocation } from "../src/memory-location.js";
```

This is simpler than aliasing and avoids TypeScript configuration complications. TypeScript will find type definitions from the `types/` directory through the existing tsconfig paths.

## TypeScript Configuration

### Update Types Array

The main change needed in `tsconfig.json` is updating the types array:

```diff
- "types": ["vitest/globals", "@testing-library/jest-dom"]
+ "types": ["bun", "@testing-library/jest-dom"]
```

This tells TypeScript to use Bun's type definitions instead of Vitest's.

No other tsconfig changes are needed - the existing paths configuration pointing to `.d.ts` files works fine with relative imports.

## Test Setup and Environment

### Running from the Correct Directory

Tests must be run from the **root directory**, not from `packages/wouter/`. This is because `bunfig.toml` uses paths relative to the root:

```toml
[test]
preload = ["./packages/wouter/test/setup.ts"]
```

Running from a subdirectory will cause the preload to fail silently, and tests will break with undefined globals.

### The Happy-DOM URL Requirement

The setup file configures happy-dom with an explicit `url`:

```typescript
GlobalRegistrator.register({
  url: "https://wouter.dev",  // Critical for History API
  width: 1024,
  height: 768,
});
```

Without this URL, the History API (`history.pushState`, `history.replaceState`) won't work properly. This was discovered when tests using `navigate()` were failing.

## Type Testing with `expectTypeOf`

Bun test (v1.2.20+) supports `expectTypeOf` from `"bun:test"`, but the verification model is different.

### The Two-Step Model

Unlike Vitest, Bun's `expectTypeOf` is a **no-op at runtime**. Type assertions are verified by running `tsc` separately:

```bash
bun test              # Runs tests, ignores expectTypeOf
bunx tsc --noEmit     # Verifies type assertions
```

This means you need both commands in CI to verify runtime behavior and type correctness.

### The Runtime Execution Caveat

Since `bun test` executes all test code (even type-only assertions), code like this will actually run:

```typescript
test("type check", () => {
  // @ts-expect-error - testing invalid props
  <Router />  // This will execute and may crash!
});
```

If the component crashes at runtime without required props, `bun test` will fail even though it's meant as a type-only test.

**Strategy:** Keep `.test-d.ts` files separate from runtime tests. Configure your test glob patterns to exclude them from `bun test` while including them in `tsc` checks.

## Migration Tips

- Start with simple test files (fewer dependencies, no complex mocks) to validate the setup
- Use `.bun.test.tsx` extension during migration to run old and new tests side-by-side
- Watch for `toBeCalled*` matchers - they're the most common API difference that breaks silently
- If tests fail with "undefined is not an object", check that you're running from the root directory
- Use relative imports (`../src/`) instead of package names - it's simpler and avoids configuration complexity
- **Tests for `global-this*` functionality can be dropped** - these will be run in Bun anyway and don't need separate test coverage
- **`@vitest-environment node` comments are no longer needed** - Bun handles SSR testing well without environment configuration

## Known Limitations

- **Fake timers** are not yet implemented in Bun test (as of v1.3.0)
- **Module mocking** with `vi.mock()` has a different API in Bun (not yet explored in this migration)

## Additional Resources

- [Bun Test Runner Documentation](https://bun.com/docs/test)
- [Writing Tests with Bun](https://bun.com/docs/test/writing-tests)
