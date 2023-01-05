import { useSyncExternalStore, useEvent } from "./react-deps.js";

/*
 * Transforms `path` into its relative `base` version
 * If base isn't part of the path provided returns absolute path e.g. `~/app`
 */
const relativePath = (base = "", path = location.pathname) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path;

const absolutePath = (to, base = "") =>
  to[0] === "~" ? to.slice(1) : base + to;

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const eventPopstate = "popstate";
const eventPushState = "pushState";
const eventReplaceState = "replaceState";
const eventHashchange = "hashchange";
export const events = [
  eventPopstate,
  eventPushState,
  eventReplaceState,
  eventHashchange,
];

const subscribeToLocationUpdates = (callback) => {
  for (const event of events) {
    addEventListener(event, callback);
  }
  return () => {
    for (const event of events) {
      removeEventListener(event, callback);
    }
  };
};

export const useLocationProperty = (fn) =>
  useSyncExternalStore(subscribeToLocationUpdates, fn);

const currentSearch = () => location.search;
export const useSearch = () => useLocationProperty(currentSearch);

const currentPathname = () => location.pathname;
export const usePathname = () => useLocationProperty(currentPathname);

export const navigate = (to, { replace = false } = {}) =>
  history[replace ? eventReplaceState : eventPushState](null, "", to);

// the 2nd argument of the `useLocation` return value is a function
// that allows to perform a navigation.
//
// the function reference should stay the same between re-renders, so that
// it can be passed down as an element prop without any performance concerns.
// (This is achieved via `useEvent`.)
export default (opts = {}) => [
  relativePath(opts.base, usePathname()),
  useEvent((to, navOpts) => navigate(absolutePath(to, opts.base), navOpts)),
];

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
if (typeof history !== "undefined") {
  for (const type of [eventPushState, eventReplaceState]) {
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
}
