import mitt from "mitt";
import { useSyncExternalStore } from "./react-deps.js";

/**
 * In-memory location that supports navigation
 */

export const memoryLocation = ({
  path = "/",
  static: staticLocation,
  record,
} = {}) => {
  let currentPath = path;
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

  function reset() {
    // clean history array with mutation to preserve link
    history.splice(0, history.length);

    navigateImplementation(path);
  }

  return {
    hook: useMemoryLocation,
    navigate,
    history: record ? history : undefined,
    reset: record ? reset : undefined,
  };
};
