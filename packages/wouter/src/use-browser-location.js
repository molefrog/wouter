import { useSyncExternalStore } from "./react-deps.js";

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const events = ["popstate", "pushState", "replaceState", "hashchange"];

let listeners = [];
const onLocationChange = () => listeners.forEach((callback) => callback());

// Native events can run microtasks between listeners. Notify all subscribers
// together so React can process parent and child updates in the same batch.
const subscribeToLocationUpdates = (callback) => {
  if (listeners.push(callback) === 1)
    events.forEach((event) => addEventListener(event, onLocationChange));

  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
    if (!listeners.length)
      events.forEach((event) => removeEventListener(event, onLocationChange));
  };
};

export const useLocationProperty = (fn, ssrFn) =>
  useSyncExternalStore(subscribeToLocationUpdates, fn, ssrFn);

const currentSearch = () => location.search;

export const useSearch = ({ ssrSearch } = {}) =>
  useLocationProperty(
    currentSearch,
    // != null checks for both null and undefined, but allows empty string ""
    // This allows proper hydration: server renders with ssrSearch="?foo",
    // client hydrates with just <Router /> and reads from location.search
    ssrSearch != null ? () => ssrSearch : currentSearch
  );

const currentPathname = () => location.pathname;

export const usePathname = ({ ssrPath } = {}) =>
  useLocationProperty(
    currentPathname,
    // != null checks for both null and undefined, but allows empty string ""
    // This allows proper hydration: server renders with ssrPath="/foo",
    // client hydrates with just <Router /> and reads from location.pathname
    ssrPath != null ? () => ssrPath : currentPathname
  );

const currentHistoryState = () => history.state;
export const useHistoryState = () =>
  useLocationProperty(currentHistoryState, () => null);

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
if (typeof history !== "undefined" && typeof window[patchKey] === "undefined") {
  for (const type of ["pushState", "replaceState"]) {
    const original = history[type];
    // TODO: we should be using unstable_batchedUpdates to avoid multiple re-renders,
    // however that will require an additional peer dependency on react-dom.
    // See: https://github.com/reactwg/react-18/discussions/86#discussioncomment-1567149
    history[type] = function () {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  }

  // patch history object only once
  // See: https://github.com/molefrog/wouter/issues/167
  Object.defineProperty(window, patchKey, { value: true });
}
