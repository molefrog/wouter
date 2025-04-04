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

export const navigate = (to, { state = null, replace = false } = {}) => {
  const [hash, search] = to.replace(/^#?\/?/, "").split("?");

  const newRelativePath =
    location.pathname + (search ? `?${search}` : location.search) + `#/${hash}`;
  const oldURL = window.location.href;
  const newURL = new URL(newRelativePath, window.location.origin).href;

  if (replace) {
    history.replaceState(state, "", newRelativePath);
  } else {
    history.pushState(state, "", newRelativePath);
  }

  const event =
    typeof HashChangeEvent !== "undefined"
      ? new HashChangeEvent("hashchange", { oldURL, newURL })
      : new Event("hashchange", { detail: { oldURL, newURL } });

  dispatchEvent(event);
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
