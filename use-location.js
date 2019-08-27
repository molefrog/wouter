import { useEffect, useState, useCallback } from "./react-deps.js";

export default ({ basepath = '', ...others } = {}) => {
  const [path, update] = useState(location.pathname);

  useEffect(() => {
    patchHistoryEvents();

    const events = ["popstate", "pushState", "replaceState"];
    const handler = () => update(location.pathname);

    events.map(e => addEventListener(e, handler));
    return () => events.map(e => removeEventListener(e, handler));
  }, []);

  // the 2nd argument of the `useLocation` return value is a function
  // that allows to perform a navigation.
  //
  // the function reference should stay the same between re-renders, so that
  // it can be passed down as an element prop without any performance concerns.
  const navigate = useCallback(
    (to, replace, state) => history[replace ? "replaceState" : "pushState"](state, 0, basepath + to),
    []
  );

  return [path, navigate];
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
