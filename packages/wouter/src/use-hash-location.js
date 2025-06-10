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
  const oldURL = location.href;
  let newURL, newHistoryStatePath;

  if (location.protocol === "data:") {
    const newHash = "#/" + to.replace(/^#?\/?/, "");
    newHistoryStatePath = newHash;
    newURL = oldURL.split("#")[0] + newHash;
  } else {
    const [hash, search] = to.replace(/^#?\/?/, "").split("?");
    newHistoryStatePath =
      location.pathname +
      (search ? `?${search}` : location.search) +
      `#/${hash}`;
    newURL = new URL(newHistoryStatePath, location.origin).href;
  }

  if (replace) {
    history.replaceState(state, "", newHistoryStatePath);
  } else {
    history.pushState(state, "", newHistoryStatePath);
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
