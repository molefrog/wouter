import {
  useRef,
  useInsertionEffect,
  useLayoutEffect,
  useEffect,
  useSyncExternalStore as useReactSyncExternalStore,
} from "react";

export {
  useMemo,
  useRef,
  useContext,
  createContext,
  isValidElement,
  cloneElement,
  createElement,
  Fragment,
  forwardRef,
} from "react";

// A fresh getter makes React 18 refresh its store instance after render-phase
// state updates. Without it, returning to the initial location can be missed.
// https://github.com/facebook/react/pull/25578
export const useSyncExternalStore = (
  subscribe,
  getSnapshot,
  getServerSnapshot
) =>
  useReactSyncExternalStore(subscribe, () => getSnapshot(), getServerSnapshot);

// React 18 warns when useLayoutEffect runs during server rendering.
// Redirects still need a layout effect in the browser, before the next paint.
const canUseDOM = !!(
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
);
export const useIsomorphicLayoutEffect = canUseDOM
  ? useLayoutEffect
  : useEffect;

// Keep callbacks stable while using the latest committed handler.
// React's useEffectEvent is restricted to Effects, so it cannot replace the
// callbacks passed to components and called by click/navigation handlers here.
export const useEvent = (fn) => {
  const ref = useRef([fn, (...args) => ref[0](...args)]).current;
  // Per Dan Abramov: useInsertionEffect executes marginally closer to the
  // correct timing for ref synchronization than useLayoutEffect on React 18.
  // See: https://github.com/facebook/react/pull/25881#issuecomment-1356244360
  useInsertionEffect(() => {
    ref[0] = fn;
  });
  return ref[1];
};
