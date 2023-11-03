import { useSyncExternalStore } from "./react-deps.js";

// fortunately `hashchange` is a native event, so there is no need to
// patch `history` object (unlike `pushState/replaceState` events)
const subscribeToHashUpdates = (callback) => {
  addEventListener("hashchange", callback);
  return () => removeEventListener("hashchange", callback);
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
