import mitt from "mitt";
import { useSyncExternalStore } from "./react-deps.js";
import { relativePath } from "./paths.js";

/**
 * In-memory location that supports navigation
 */

export const memoryLocation = ({
  path = "/",
  static: staticLocation,
  record,
} = {}) => {
  let currentPath = path;
  const history = [];
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

  const useMemoryLocation = ({ base } = {}) => {
    const location = useSyncExternalStore(
      (cb) => {
        emitter.on("navigate", cb);
        return () => emitter.off("navigate", cb);
      },
      () => currentPath
    );

    return [relativePath(base, location), navigate];
  };

  return {
    hook: useMemoryLocation,
    navigate,
    history: record ? history : undefined,
  };
};
