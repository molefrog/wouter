import { useState, useSyncExternalStore } from "react";
import { Path, LocationHook, BaseLocationHook } from "wouter";
import mitt from "mitt";

import { relativePath } from "../src/paths";

/**
 * Static location that never changes
 */
export const staticLocation = (path: Path): { hook: BaseLocationHook } => ({
  hook: ({ base }) => [
    relativePath(base, path),
    (to: Path) => {} /* does nothing */,
  ],
});

/**
 * In-memory location that supports navigation
 */
export const memoryLocation = (
  initialPath: Path = "/"
): { hook: BaseLocationHook; navigate: (path: Path) => void } => {
  let currentPath = initialPath;
  const emitter = mitt();

  const navigate = (path: Path) => {
    currentPath = path;
    emitter.emit("navigate", path);
  };

  const useMemoryLocation: BaseLocationHook = () => {
    const location = useSyncExternalStore(
      (cb) => {
        emitter.on("navigate", cb);
        return () => emitter.off("navigate", cb);
      },
      () => currentPath
    );

    return [location, navigate];
  };

  return { hook: useMemoryLocation, navigate };
};

export const customHookWithReturn =
  (initialPath = "/") =>
  () => {
    const [path, updatePath] = useState(initialPath);
    const navigate = (path: string) => {
      updatePath(path);
      return "foo";
    };

    return [path, navigate];
  };
