import { useSyncExternalStore } from "./react-deps.js";

// array of callback subscribed to hash updates
let listeners = [];

const onHashChange = () => listeners.forEach((cb) => cb());

// we subscribe to `hashchange` only once when needed to guarantee that
// all listeners are called synchronously
const subscribeToHashUpdates = (callback) => {
  if (listeners.push(callback) === 1)
    addEventListener("hashchange", onHashChange);

  return () => {
    listeners = listeners.filter((i) => i !== callback);
    if (!listeners.length) removeEventListener("hashchange", onHashChange);
  };
};

// leading '#' is ignored, leading '/' is optional
const hashPrefix = /^#?\/?/;
const currentHashLocation = () => "/" + location.hash.replace(hashPrefix, "");

export const navigate = (to, { state = null, replace = false } = {}) => {
  const oldURL = location.href;

  const [hash, search] = to.replace(hashPrefix, "").split("?");

  // Works for ALL protocols including data:
  const url = new URL(oldURL);
  url.hash = `/${hash}`;
  if (search) url.search = search;
  const newURL = url.href;

  history[replace ? "replaceState" : "pushState"](state, "", newURL);

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
