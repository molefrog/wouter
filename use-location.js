import { useEffect, useState } from "./react-deps.js";

export default () => {
  const [path, update] = useState(location.pathname);

  useEffect(() => {
    patchHistoryEvents();

    const events = ["popstate", "pushState", "replaceState"];
    const handler = () => update(location.pathname);

    events.map(e => addEventListener(e, handler));
    return () => events.map(e => removeEventListener(e, handler));
  }, []);

  return [path, to => history.pushState(0, 0, to)];
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
