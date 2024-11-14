import mitt from "mitt";
import { useSyncExternalStore } from "./react-deps.js";

/**
 * In-memory location that supports navigation
 */

export const memoryLocation = ({
  path = "/",
  searchPath = "",
  static: staticLocation,
  record,
} = {}) => {
  let currentPath = path + (searchPath && (path.split("?")[1] ? "&" : "?")) + searchPath;
  let currentSearch = currentPath.split("?")[1] || "";
  const history = [currentPath];
  const emitter = mitt();

  const navigateImplementation = (path, { replace = false } = {}) => {
    if (record) {
      if (replace) {
        history.splice(history.length - 1, 1, path);
      } else {
        history.push(path);
      }
    }

    currentPath = path;
    currentSearch = path.split("?")[1] || "";
    emitter.emit("navigate", path);
  };

  const navigate = !staticLocation ? navigateImplementation : () => null;

  const subscribe = (cb) => {
    emitter.on("navigate", cb);
    return () => emitter.off("navigate", cb);
  };

  const useMemoryLocation = () => [
    useSyncExternalStore(subscribe, () => currentPath),
    navigate,
  ];

  const useMemoryQuery = () => [
    useSyncExternalStore(subscribe, () => currentSearch)
  ];

  function reset() {
    // clean history array with mutation to preserve link
    history.splice(0, history.length);

    navigateImplementation(path + (searchPath && (path.split("?")[1] ? "&" : "?")) + searchPath);
  }

  return {
    hook: useMemoryLocation,
    searchHook: useMemoryQuery,
    navigate,
    history: record ? history : undefined,
    reset: record ? reset : undefined,
  };
};
