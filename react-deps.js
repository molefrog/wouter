import { useEffect, useLayoutEffect, useRef } from "react";

export {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
  isValidElement,
  cloneElement,
  createElement,
  Fragment,
  forwardRef,
} from "react";

export { useSyncExternalStore } from "use-sync-external-store/shim";

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.

// See Redux's source code for reference:
// https://github.com/reduxjs/react-redux/blob/master/src/utils/useIsomorphicLayoutEffect.ts
export const canUseDOM = !!(
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
);

export const useIsomorphicLayoutEffect = canUseDOM
  ? useLayoutEffect
  : useEffect;

// Userland polyfill while we wait for the forthcoming
// https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
// Note: "A high-fidelty polyfill for useEvent is not possible because
// there is no lifecycle or Hook in React that we can use to switch
// .current at the right timing."
// So we will have to make do with this "close enough" approach for now.
export const useEvent = (fn) => {
  const ref = useRef([fn, (...args) => ref[0](...args)]).current;
  useIsomorphicLayoutEffect(() => {
    ref[0] = fn;
  });
  return ref[1];
};
