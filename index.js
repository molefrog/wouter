import pathToRegexp from "path-to-regexp";
import {
  useRef,
  useMemo,
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
  isValidElement,
  cloneElement,
  createElement as h
} from "react";

import makeHistory from "./history";

const RouterCtx = createContext();

export const buildRouter = (options = {}) => {
  return {
    history: options.history || makeHistory(),
    matchFn: options.matchFn || makeMatcher()
  };
};

export const Router = props => {
  const ref = useRef(null);

  // this little trick allows to avoid having unnecessary
  // calls to potentially expensive `buildRouter` method.
  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  function getRouter() {
    if (ref.current !== null) {
      return ref.current;
    } else {
      return (ref.current = buildRouter(props));
    }
  }

  return h(RouterCtx.Provider, {
    value: getRouter(),
    children: props.children
  });
};

export const useRouter = () => {
  const providedRouter = useContext(RouterCtx);

  // either obtain the router from the outer context
  // (provided by the `<Router /> component) or create
  // a default one on demand.
  const router = useMemo(
    () => (providedRouter ? providedRouter : buildRouter()),
    [providedRouter]
  );

  return router;
};

export const useLocation = () => {
  const history = useRouter().history;
  const [location, update] = useState(history.path());

  // subscribe to history updates
  useEffect(() => history.subscribe(x => update(x)), [history]);
  const pushLocation = useCallback(y => history.push(y), [history]);

  return [location, pushLocation];
};

export const useRoute = pattern => {
  const router = useRouter();
  const [path] = useLocation();

  return router.matchFn(pattern, path);
};

export const Route = props => {
  const { children, path } = props;
  const [matches, params] = useRoute(props.path);

  if (!matches) {
    return null;
  }

  // React-Router style `component` prop
  if (props.component) {
    return h(props.component, { params: params });
  }

  // support render prop or plain children
  return typeof children === "function" ? children(params) : children;
};

export const Link = props => {
  const href = props.href || props.to;
  const child = props.children;

  const [, navigate] = useLocation();
  const onClick = useCallback(
    event => {
      event.preventDefault();
      navigate(href);
    },
    [href]
  );

  // wraps children in `a` if needed
  const extraProps = { href, onClick, to: null };
  const jsx = isValidElement(child) ? child : h("a", props);

  return cloneElement(jsx, extraProps);
};

// creates a matcher function
const makeMatcher = () => {
  let cache = {};

  // obtains a cached regexp version of the pattern
  const convertToRgx = pattern => {
    if (cache[pattern]) return cache[pattern];
    let keys = [];
    return (cache[pattern] = [pathToRegexp(pattern, keys), keys]);
  };

  return (pattern, path) => {
    const [regexp, keys] = convertToRgx(pattern);
    const out = regexp.exec(path);

    if (!out) return [false, null];

    // formats an object with matched params
    const params = keys.reduce((params, key, i) => {
      params[key.name] = out[i + 1];
      return params;
    }, {});

    return [true, params];
  };
};
