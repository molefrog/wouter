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
  state: initialState = null,
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
  const emitter = mitt();

  const navigateImplementation = (path, { replace = false, state } = {}) => {
    if (record) {
      if (replace) {
        history.splice(history.length - 1, 1, path);
      } else {
        history.push(path);
      }
    }

    [currentPath, currentSearch = ""] = path.split("?");

    // Update state if provided, otherwise keep current state
    // This matches browser behavior where state persists unless explicitly changed
    if (state !== undefined) {
      currentState = state;
    }

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

  const useMemoryQuery = () =>
    useSyncExternalStore(subscribe, () => currentSearch);

  const useMemoryState = () =>
    useSyncExternalStore(subscribe, () => currentState);

  // Attach searchHook to the location hook for auto-inheritance in Router
  useMemoryLocation.searchHook = useMemoryQuery;

  function reset() {
    // clean history array with mutation to preserve link
    history.splice(0, history.length);

    // Reset state to initial state
    currentState = initialState;

    navigateImplementation(initialPath);
  }

  // Create a getter for state that always returns current value
  const stateGetter = {
    get current() {
      return currentState;
    },
  };

  return {
    hook: useMemoryLocation,
    searchHook: useMemoryQuery,
    stateHook: useMemoryState,
    navigate,
    history: record ? history : undefined,
    reset: record ? reset : undefined,
    state: stateGetter,
  };
};
