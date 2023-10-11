import mitt from "mitt";
import { useSyncExternalStore, useEvent } from "./react-deps.js";
import { absolutePath, relativePath } from "./paths.js";

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

  const useMemoryLocation = ({ base } = {}) => {
    const location = useSyncExternalStore(subscribe, () => currentPath);

    return [
      relativePath(base, location),
      useEvent((to, options) => navigate(absolutePath(to, base), options)),
    ];
  };

  return {
    hook: useMemoryLocation,
    navigate,
    history: record ? history : undefined,
  };
};
