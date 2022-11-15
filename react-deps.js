import { useEffect, useLayoutEffect } from "react";

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
