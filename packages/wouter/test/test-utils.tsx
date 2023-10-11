import { useState, useSyncExternalStore } from "react";
import { Path, BaseLocationHook } from "wouter";
import mitt from "mitt";

// @ts-ignore todo: when wouter/memory-location is ready remove this import
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

/**
 * Executes a callback and returns a promise that resolve when `hashchange` event is fired.
 * Rejects after `throwAfter` milliseconds.
 */
export const waitForHashChangeEvent = async (
  cb: () => void,
  throwAfter = 1000
) =>
  new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;

    const onChange = () => {
      resolve();
      clearTimeout(timeout);
      window.removeEventListener("hashchange", onChange);
    };

    window.addEventListener("hashchange", onChange);
    cb();

    timeout = setTimeout(() => {
      reject(new Error("Timed out: `hashchange` event did not fire!"));
      window.removeEventListener("hashchange", onChange);
    }, throwAfter);
  });
