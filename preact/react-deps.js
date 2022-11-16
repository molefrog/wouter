export {
  isValidElement,
  createContext,
  cloneElement,
  createElement,
  Fragment,
} from "preact";
export {
  useRef,
  useEffect,
  useLayoutEffect as useIsomorphicLayoutEffect,
  useState,
  useContext,
  useCallback,
} from "preact/hooks";

export { useSyncExternalStore } from "preact/compat";

// provide forwardRef stub for preact
export function forwardRef(component) {
  return component;
}
