import { useState, useLayoutEffect, useEffect, useRef } from "preact/hooks";
export {
  isValidElement,
  createContext,
  cloneElement,
  createElement,
  Fragment,
} from "preact";
export {
  useLayoutEffect as useIsomorphicLayoutEffect,
  useLayoutEffect as useInsertionEffect,
  useState,
  useContext,
} from "preact/hooks";

// Copied from:
// https://github.com/facebook/react/blob/main/packages/shared/ExecutionEnvironment.js
const canUseDOM = !!(
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
);

// TODO: switch to `export { useSyncExternalStore } from "preact/compat"` once we update Preact to >= 10.11.3
function is(x, y) {
  return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);
}
export function useSyncExternalStore(subscribe, getSnapshot, getSSRSnapshot) {
  if (getSSRSnapshot && !canUseDOM) getSnapshot = getSSRSnapshot;
  const value = getSnapshot();

  const [{ _instance }, forceUpdate] = useState({
    _instance: { _value: value, _getSnapshot: getSnapshot },
  });

  useLayoutEffect(() => {
    _instance._value = value;
    _instance._getSnapshot = getSnapshot;

    if (!is(_instance._value, getSnapshot())) {
      forceUpdate({ _instance });
    }
  }, [subscribe, value, getSnapshot]);

  useEffect(() => {
    if (!is(_instance._value, _instance._getSnapshot())) {
      forceUpdate({ _instance });
    }

    return subscribe(() => {
      if (!is(_instance._value, _instance._getSnapshot())) {
        forceUpdate({ _instance });
      }
    });
  }, [subscribe]);

  return value;
}

// provide forwardRef stub for preact
export function forwardRef(component) {
  return component;
}

// Userland polyfill while we wait for the forthcoming
// https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
// Note: "A high-fidelty polyfill for useEvent is not possible because
// there is no lifecycle or Hook in React that we can use to switch
// .current at the right timing."
// So we will have to make do with this "close enough" approach for now.
export const useEvent = (fn) => {
  const ref = useRef([fn, (...args) => ref[0](...args)]).current;
  useLayoutEffect(() => {
    ref[0] = fn;
  });
  return ref[1];
};
