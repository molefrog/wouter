import { useState, useLayoutEffect, useEffect } from "preact/hooks";
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

// TODO: switch to "export { useSyncExternalStore } from "preact/compat" once we update Preact to >= 10.11.3
function is(x, y) {
  return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);
}
export function useSyncExternalStore(subscribe, getSnapshot) {
  const value = getSnapshot();

  const [{ _instance }, forceUpdate] = useState({
    _instance: { _value: value, _getSnapshot: getSnapshot }
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
