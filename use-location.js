import { useEffect, useRef, useState } from "./react-deps.js";

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const eventPopstate = "popstate";
export const eventPushState = "pushState";
export const eventReplaceState = "replaceState";
export const events = [eventPopstate, eventPushState, eventReplaceState];

export default ({ base = "" } = {}) => {
  const [path, update] = useState(() => currentPathname(base)); // @see https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const prevPath = useRef(path);

  useEffect(() => {
    // this function checks if the location has been changed since the
    // last render and updates the state only when needed.
    // unfortunately, we can't rely on `path` value here, since it can be stale,
    // that's why we store the last pathname in a ref.
    const checkForUpdates = () => {
      const pathname = currentPathname(base);
      prevPath.current !== pathname && update((prevPath.current = pathname));
    };

    events.map((e) => addEventListener(e, checkForUpdates));

    // it's possible that an update has occurred between render and the effect handler,
    // so we run additional check on mount to catch these updates. Based on:
    // https://gist.github.com/bvaughn/e25397f70e8c65b0ae0d7c90b731b189
    checkForUpdates();

    return () => events.map((e) => removeEventListener(e, checkForUpdates));
  }, [base]);

  return path;
};

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
if (typeof history !== "undefined") {
  for (const type of [eventPushState, eventReplaceState]) {
    const original = history[type];

    history[type] = function() {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  }
}

const currentPathname = (base, path = location.pathname.toLowerCase()) =>
  !path.indexOf(base.toLowerCase()) ? path.slice(base.length) || "/" : path;
