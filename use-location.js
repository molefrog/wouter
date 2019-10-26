import { useEffect, useRef, useState, useCallback } from "./react-deps.js";

export default () => {
  const [path, update] = useState(location.pathname);
  const [currentState, updateCurrentState] = useState(history.state);
  const prevPath = useRef(path);

  useEffect(() => {
    patchHistoryEvents();

    // this function checks if the location has been changed since the
    // last render and updates the state only when needed.
    // unfortunately, we can't rely on `path` value here, since it can be stale,
    // that's why we store the last pathname in a ref.
    const checkForUpdates = () => {
      if (prevPath.current !== location.pathname) {
        update((prevPath.current = location.pathname));
      }

      if (currentState !== history.state) {
        updateCurrentState(history.state);
      }
    };

    const events = ["popstate", "pushState", "replaceState"];
    events.map(e => addEventListener(e, checkForUpdates));

    // it's possible that an update has occurred between render and the effect handler,
    // so we run additional check on mount to catch these updates. Based on:
    // https://gist.github.com/bvaughn/e25397f70e8c65b0ae0d7c90b731b189
    checkForUpdates();

    return () => events.map(e => removeEventListener(e, checkForUpdates));
  }, [currentState]);

  // the 2nd argument of the `useLocation` return value is a function
  // that allows to perform a navigation.
  //
  // the function reference should stay the same between re-renders, so that
  // it can be passed down as an element prop without any performance concerns.
  const navigate = useCallback(
    (to, replace, state) =>
      history[replace ? "replaceState" : "pushState"](state || 0, 0, to),
    []
  );

  return [path, navigate, currentState];
};

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031

let patched = 0;

const patchHistoryEvents = () => {
  if (patched) return;

  ["pushState", "replaceState"].map(type => {
    const original = history[type];

    history[type] = function() {
      const result = original.apply(this, arguments);
      const event = new Event(type);
      event.arguments = arguments;

      dispatchEvent(event);
      return result;
    };
  });

  return (patched = 1);
};
