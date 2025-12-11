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

**Note:** The `transition` prop is now part of wouter's type definitions (`NavigateOptions`) and is available on all location hooks (`useBrowserLocation`, `useHashLocation`, `memoryLocation`). When `<Link>` calls `navigate(targetPath, props)`, all props are automatically passed as navigation options, making them available in `aroundNav`.

```js
import { flushSync } from "react-dom";

function aroundNav(navigate, to, options) {
  // Feature detection
  if (!document.startViewTransition) {
    navigate(to, options);
    return;
  }

  // Only use transitions when explicitly requested
  if (options?.transition) {
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

Wouter provides built-in types for view transitions:

```typescript
import type { NavigateOptions, AroundNavHandler } from "wouter";

// NavigateOptions already includes transition
const navigate = (to: string, options?: NavigateOptions) => {
  // options.transition is available
  // options.replace is available
  // options.state is available
};

// AroundNavHandler type for the aroundNav callback
const aroundNav: AroundNavHandler = (navigate, to, options) => {
  if (options?.transition) {
    // handle transition
  }
  navigate(to, options);
};
```

The `transition` option is included in `NavigateOptions` along with `replace` and `state`, and is available on all built-in location hooks.
