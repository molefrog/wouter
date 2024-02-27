import { useSyncExternalStore } from "./react-deps.js";

// array of callback subscribed to hash updates
const listeners = {
  v: [],
};

const onHashChange = () => listeners.v.forEach((cb) => cb());

// we subscribe to `hashchange` only once when needed to guarantee that
// all listeners are called synchronously
const subscribeToHashUpdates = (callback) => {
  if (listeners.v.push(callback) === 1)
    addEventListener("hashchange", onHashChange);

  return () => {
    listeners.v = listeners.v.filter((i) => i !== callback);
    if (!listeners.v.length) removeEventListener("hashchange", onHashChange);
  };
};

// leading '#' is ignored, leading '/' is optional
const currentHashLocation = () => "/" + location.hash.replace(/^#?\/?/, "");

export const navigate = (to, { state = null } = {}) => {
  // calling `replaceState` allows us to set the history
  // state without creating an extra entry
  history.replaceState(
    state,
    "",
    // keep the current pathname, current query string, but replace the hash
    location.pathname +
      location.search +
      // update location hash, this will cause `hashchange` event to fire
      // normalise the value before updating, so it's always preceeded with "#/"
      (location.hash = `#/${to.replace(/^#?\/?/, "")}`)
  );
};

export const useHashLocation = ({ ssrPath = "/" } = {}) => [
  useSyncExternalStore(
    subscribeToHashUpdates,
    currentHashLocation,
    () => ssrPath
  ),
  navigate,
];

useHashLocation.hrefs = (href) => "#" + href;
