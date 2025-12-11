# View Transitions API in Wouter

View Transitions are baseline available (as of Oct 2025). This doc describes the API for using them in wouter.

Though the browser API is super simple, there are certain obstacles to overcome:

## Problems

- `startViewTransition` accepts a callback that must modify the DOM synchronously
- `setState` can't guarantee that the DOM will be modified synchronously
- There is `flushSync` but it requires `react-dom`, we want wouter to only depend on `react`
- Wouter uses `useSyncExternalStore` to react to events. In theory sending event inside `flushSync`
  should trigger updates synchronously, but this is not 100% proven and could break

## Solution

Users implement their own behavior before and after navigate is called, so they can control
view transitions behavior.

### Basic Implementation (enable view transitions by default)

```js
import { flushSync } from "react-dom";

function aroundNav(navigate, ...navArgs) {
  // Feature detection for older browsers
  if (!document.startViewTransition) {
    navigate(...navArgs);
    return;
  }

  document.startViewTransition(() => {
    flushSync(() => {
      navigate(...navArgs);
    });
  });
}

<Router aroundNav={aroundNav}>
  <App />
</Router>;
```

Alternatively, with explicit arguments:

```js
function aroundNav(navigate, to, options) {
  if (!document.startViewTransition) {
    navigate(to, options);
    return;
  }

  document.startViewTransition(() => {
    flushSync(() => {
      navigate(to, options);
    });
  });
}
```

### Granular control (opt-in transitions)

For more control over when transitions occur:

```jsx
// In your component
<Link to="/" transition>
  Home
</Link>;

// Or programmatically
const [location, navigate] = useLocation();
navigate("/", { transition: true });
```

**Note:** The `transition` prop doesn't need to be explicitly handled in wouter's source code. When `<Link>` calls `navigate(targetPath, props)` (see `packages/wouter/src/index.js:301`), all props are automatically passed as navigation options. This means any prop you add to `<Link>` becomes available in `aroundNav` options—`transition` is just a convention.

```js
import { flushSync } from "react-dom";

function aroundNav(navigate, to, options) {
  // Feature detection
  if (!document.startViewTransition) {
    navigate(to, options);
    return;
  }

  // TODO: Skip transitions for back/forward navigation (popstate events)
  // This prevents jarring transitions when users use browser back/forward buttons

  if (options.transition) {
    document.startViewTransition(() => {
      flushSync(() => {
        navigate(to, options);
      });
    });
  } else {
    navigate(to, options);
  }
}
```

### TypeScript types

```typescript
import type { NavigateOptions } from "wouter";

// Extend NavigateOptions to include transition flag
interface TransitionNavigateOptions extends NavigateOptions {
  transition?: boolean;
}

type AroundNavFunction = (
  navigate: (to: string, options?: NavigateOptions) => void,
  to: string,
  options: TransitionNavigateOptions
) => void;
```
