import { useSyncExternalStore, useEvent } from "./react-deps.js";
import { absolutePath, relativePath } from "./paths.js";

// fortunately `hashchange` is a native event, so there is need to patch `history` object
const subscribeToHashUpdates = (callback) => {
  addEventListener("hashchange", callback);
  return () => removeEventListener("hashchange", callback);
};

// leading '#' is ignored, leading '/' is optional
const currentHashLocation = () => "/" + location.hash.replace(/^#?\/?/, "");

export const navigate = (to, _options = {}) => {
  location.hash = `/${to.replace(/^#?\/?/, "")}`;
};

export const useHashLocation = ({ base, ssrPath = "/" } = {}) => [
  relativePath(
    base,
    useSyncExternalStore(
      subscribeToHashUpdates,
      currentHashLocation,
      () => ssrPath
    )
  ),

  useEvent((to, navOpts) => navigate(absolutePath(to, base), navOpts)),
];
