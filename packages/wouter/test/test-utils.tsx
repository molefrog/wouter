import { ReactNode, useMemo, useState, useSyncExternalStore } from "react";
import { Path, LocationHook, BaseLocationHook, Router } from "wouter";
import mitt from "mitt";

export const RouterWithStaticLocation = ({
  children,
  location,
}: {
  children: ReactNode;
  location: Path;
}) => {
  const useStaticLocation: LocationHook = () => [location, () => null];
  return <Router hook={useStaticLocation}>{children}</Router>;
};

/**
 * In-memory location that supports navigation
 */
export const createMemoryLocation = (
  initialPath: string = "/"
): { hook: BaseLocationHook; navigate: (path: string) => void } => {
  let currentPath = initialPath;
  const emitter = mitt();

  const navigate = (path: string) => {
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

export const memoryLocation = createMemoryLocation;

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
