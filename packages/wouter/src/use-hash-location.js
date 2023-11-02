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
  history.pushState(
    state,
    "",
    // keep the current pathname, current query string, but replace the hash
    // (leading '#' and '/' are optional, see above)
    location.pathname + location.search + `#/${to.replace(/^#?\/?/, "")}`
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
