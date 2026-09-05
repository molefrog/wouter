import { useState, useLayoutEffect, useEffect, useRef } from "preact/hooks";
export {
  isValidElement,
  createContext,
  cloneElement,
  createElement,
  Fragment,
} from "preact";
export {
  useMemo,
  useRef,
  useLayoutEffect as useIsomorphicLayoutEffect,
  useContext,
} from "preact/hooks";

// Copied from:
// https://github.com/facebook/react/blob/main/packages/shared/ExecutionEnvironment.js
const canUseDOM = !!(
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
);

// Keep this small adapter: preact/compat adds unrelated compatibility code and
// its store hook does not use the server snapshot. See specs/browser-support.md.
export function useSyncExternalStore(subscribe, getSnapshot, getSSRSnapshot) {
  if (getSSRSnapshot && !canUseDOM) getSnapshot = getSSRSnapshot;
  const value = getSnapshot();

  const [{ _instance }, forceUpdate] = useState({
    _instance: { _value: value, _getSnapshot: getSnapshot },
  });

  useLayoutEffect(() => {
    _instance._value = value;
    _instance._getSnapshot = getSnapshot;

    if (!Object.is(_instance._value, getSnapshot())) {
      forceUpdate({ _instance });
    }
  }, [subscribe, value, getSnapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!Object.is(_instance._value, _instance._getSnapshot())) {
      forceUpdate({ _instance });
    }

    return subscribe(() => {
      if (!Object.is(_instance._value, _instance._getSnapshot())) {
        forceUpdate({ _instance });
      }
    });
  }, [subscribe]); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
}

// Preact passes legacy context as the second argument, not a forwarded ref.
export function forwardRef(component) {
  return (props) => component(props);
}

// Keep callbacks stable while using the latest committed handler.
export const useEvent = (fn) => {
  const ref = useRef([fn, (...args) => ref[0](...args)]).current;
  useLayoutEffect(() => {
    ref[0] = fn;
  });
  return ref[1];
};
