import { useSyncExternalStore, useEvent } from "./react-deps.js";

/*
 * Transforms `path` into its relative `base` version
 * If base isn't part of the path provided returns absolute path e.g. `~/app`
 */
export const relativePath = (base = "", path = location.pathname) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path;

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const eventPopstate = "popstate";
const eventPushState = "pushState";
const eventReplaceState = "replaceState";
export const events = [eventPopstate, eventPushState, eventReplaceState];

export const subscribeToLocationUpdates = (callback) => {
  for (const event of events) {
    window.addEventListener(event, callback);
  }
  return () => {
    for (const event of events) {
      window.removeEventListener(event, callback);
    }
  };
};

const currentSearch = () => location.search;
export const useSearch = () =>
  useSyncExternalStore(subscribeToLocationUpdates, currentSearch);

const currentPathname = () => location.pathname;
export const usePathname = () =>
  useSyncExternalStore(subscribeToLocationUpdates, currentPathname);

export const navigate = (to, { replace = false } = {}, base = "") =>
  history[replace ? eventReplaceState : eventPushState](
    null,
    "",
    to[0] === "~" ? to.slice(1) : base + to
  );

// the 2nd argument of the `useLocation` return value is a function
// that allows to perform a navigation.
//
// the function reference should stay the same between re-renders, so that
// it can be passed down as an element prop without any performance concerns.
export const useNavigate = (opts = {}) =>
  useEvent((to, navOpts) => navigate(to, navOpts, opts.base));

export default (opts = {}) => [
  relativePath(opts.base, usePathname()),
  useNavigate(opts),
];

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
if (typeof history !== "undefined") {
  for (const type of [eventPushState, eventReplaceState]) {
    const original = history[type];

    history[type] = function () {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  }
}
