import { useSyncExternalStore } from "./react-deps.js";

/**
 * In-memory location that supports navigation
 */

export const memoryLocation = ({
  path = "/",
  searchPath = "",
  state: initialState = null,
  static: staticLocation,
  record,
} = {}) => {
  let initialPath = path;
  if (searchPath) {
    // join with & if path contains search query, and ? otherwise
    initialPath += path.split("?")[1] ? "&" : "?";
    initialPath += searchPath;
  }

  let [currentPath, currentSearch = ""] = initialPath.split("?");
  let currentState = initialState;
  const history = [initialPath];
  let listeners = [];

  const navigateImplementation = (path, { replace = false, state } = {}) => {
    if (record)
      history[replace && history.length ? history.length - 1 : history.length] =
        path;

    [currentPath, currentSearch = ""] = path.split("?");
    if (state !== undefined) currentState = state;
    listeners.forEach((cb) => cb());
  };

  const navigate = !staticLocation ? navigateImplementation : () => null;

  // Copy on subscription changes instead of copying on every navigation.
  const subscribe = (cb) => {
    listeners = [...listeners, cb];
    return () => {
      listeners = listeners.filter((i) => i !== cb);
    };
  };

  const getPath = () => currentPath;
  const getSearch = () => currentSearch;

  const useMemoryLocation = () => [
    useSyncExternalStore(subscribe, getPath),
    navigate,
  ];

  const useMemoryQuery = () => useSyncExternalStore(subscribe, getSearch);

  // Attach searchHook to the location hook for auto-inheritance in Router
  useMemoryLocation.searchHook = useMemoryQuery;

  function reset() {
    // clean history array with mutation to preserve link
    history.length = 0;
    navigateImplementation(initialPath, { state: initialState });
  }

  return Object.defineProperty(
    {
      hook: useMemoryLocation,
      searchHook: useMemoryQuery,
      navigate,
      history: record ? history : undefined,
      reset: record ? reset : undefined,
    },
    "state",
    { enumerable: true, get: () => currentState }
  );
};
