import { useSyncExternalStore } from "./react-deps.js";

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const events = ["popstate", "pushState", "replaceState", "hashchange"];

// Native events can run microtasks between listeners. Notify all subscribers
// together so React can process parent and child updates in the same batch.
const createSubscribe = (getWindow) => {
  let listeners = [];
  const onLocationChange = () => listeners.forEach((callback) => callback());

  return (callback) => {
    const target = getWindow();
    if (listeners.push(callback) === 1)
      events.forEach((event) =>
        target.addEventListener(event, onLocationChange)
      );

    return () => {
      listeners = listeners.filter((listener) => listener !== callback);
      if (!listeners.length)
        events.forEach((event) =>
          target.removeEventListener(event, onLocationChange)
        );
    };
  };
};

const subscribeToLocationUpdates = createSubscribe(() => window);

export const useLocationProperty = (fn, ssrFn) =>
  useSyncExternalStore(subscribeToLocationUpdates, fn, ssrFn);

const createLocationPropertyHook = (subscribe, getSnapshot, ssrKey) =>
  function useProperty(options = {}) {
    return useSyncExternalStore(
      subscribe,
      getSnapshot,
      // Nullish values fall back to the browser, but empty SSR strings are valid.
      () => options[ssrKey] ?? getSnapshot()
    );
  };

export const useSearch = createLocationPropertyHook(
  subscribeToLocationUpdates,
  () => location.search,
  "ssrSearch"
);

export const usePathname = createLocationPropertyHook(
  subscribeToLocationUpdates,
  () => location.pathname,
  "ssrPath"
);

const createHistoryStateHook = (subscribe, getSnapshot) =>
  function useState() {
    return useSyncExternalStore(subscribe, getSnapshot, () => null);
  };

export const useHistoryState = createHistoryStateHook(
  subscribeToLocationUpdates,
  () => history.state
);

export const navigate = (to, { replace = false, state = null } = {}) =>
  history[replace ? "replaceState" : "pushState"](state, "", to);

// the 2nd argument of the `useBrowserLocation` return value is a function
// that allows to perform a navigation.
export const useBrowserLocation = (opts) => [usePathname(opts), navigate];

const patchKey = Symbol.for("wouter_v3");

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
const patchHistory = (target) => {
  if (typeof target[patchKey] !== "undefined") return;

  for (const type of ["pushState", "replaceState"]) {
    const original = target.history[type];
    target.history[type] = function () {
      const result = original.apply(this, arguments);
      const event = new target.Event(type);
      event.arguments = arguments;

      target.dispatchEvent(event);
      return result;
    };
  }

  // patch history object only once
  // See: https://github.com/molefrog/wouter/issues/167
  Object.defineProperty(target, patchKey, { value: true });
};

if (typeof history !== "undefined") patchHistory(window);

const browserLocations = new WeakMap();

export const browserLocation = ({ window: target } = {}) => {
  if (!target || (typeof window !== "undefined" && target === window)) {
    useBrowserLocation.searchHook = useSearch;
    return {
      hook: useBrowserLocation,
      searchHook: useSearch,
      navigate,
      useHistoryState,
    };
  }

  // WindowProxy survives iframe navigation, but its document and history do not.
  const ownerDocument = target.document;
  let result = browserLocations.get(ownerDocument);
  if (result) return result;

  patchHistory(target);
  const subscribe = createSubscribe(() => target);
  const useScopedPathname = createLocationPropertyHook(
    subscribe,
    () => target.location.pathname,
    "ssrPath"
  );
  const searchHook = createLocationPropertyHook(
    subscribe,
    () => target.location.search,
    "ssrSearch"
  );
  const scopedNavigate = (to, { replace = false, state = null } = {}) =>
    target.history[replace ? "replaceState" : "pushState"](state, "", to);
  const useScopedLocation = (opts) => [useScopedPathname(opts), scopedNavigate];
  useScopedLocation.searchHook = searchHook;

  result = {
    hook: useScopedLocation,
    searchHook,
    navigate: scopedNavigate,
    useHistoryState: createHistoryStateHook(
      subscribe,
      () => target.history.state
    ),
  };
  browserLocations.set(ownerDocument, result);
  return result;
};
