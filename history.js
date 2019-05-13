export default function createHistory() {
  monkeyPatchHistoryEvents();

  return {
    path: () => location.pathname,
    push: to => history.replaceState({}, null, to),
    subscribe: cb => {
      const handler = () => cb(location.pathname);
      return on(handler, "popstate", "pushState", "replaceState");
    }
  };
}

// subscribe to multiple window events at once
const on = (cb, ...events) => {
  events.map(e => window.addEventListener(e, cb));
  return () => events.map(e => window.removeEventListener(e, cb));
};

// While History API does have `popState` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
const monkeyPatchHistoryEvents = (() => {
  let patched = false;

  return () => {
    if (patched) return false;

    const patchEvent = type => {
      const orig = history[type];

      return function() {
        const result = orig.apply(this, arguments);
        const event = new Event(type);
        event.arguments = arguments;
        window.dispatchEvent(event);

        return result;
      };
    };

    history.pushState = patchEvent("pushState");
    history.replaceState = patchEvent("replaceState");

    return (patched = true);
  };
})();
