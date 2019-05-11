import makeHistory from "./history.js";
import makeMatcher from "./matcher.js";

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
  createElement as h,
  Children
} from "react";

/*
 * Part 1, Hooks API: useRouter, useRoute and useLocation
 */

const RouterCtx = createContext();

export const buildRouter = (options = {}) => {
  return {
    history: options.history || makeHistory(),
    matcher: options.matcher || makeMatcher()
  };
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

  return router.matcher(pattern, path);
};

/*
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

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

export const Route = props => {
  const [matches, params] = useRoute(props.path);

  if (!matches && !props.match) {
    return null;
  }

  // React-Router style `component` prop
  if (props.component) {
    return h(props.component, { params: params });
  }

  // support render prop or plain children
  return typeof props.children === "function"
    ? props.children(params)
    : props.children;
};

export const Link = props => {
  const [, navigate] = useLocation();

  const href = props.href || props.to;
  const { children, onClick } = props.children;

  const handleClick = useCallback(
    event => {
      event.preventDefault();
      navigate(href);
      onClick && onClick();
    },
    [href, onClick, navigate]
  );

  // wraps children in `a` if needed
  const extraProps = { href, onClick: handleClick, to: null };
  const jsx = isValidElement(children) ? children : h("a", props);

  return cloneElement(jsx, extraProps);
};

export const Switch = ({ children, location }) => {
  const { matcher } = useRouter();
  const [originalLocation] = useLocation();

  let element = null;

  // this looks similar to Switch implementation from React Router
  // https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/Switch.js
  Children.forEach(children, child => {
    if (!element && isValidElement(child)) {
      const [match] = matcher(child.props.path, location || originalLocation);
      if (match) element = child;
    }
  });

  return element ? cloneElement(element, { match: true }) : null;
};

export const Redirect = props => {
  const router = useRouter();
  useEffect(() => router.history.push(props.href || props.to));

  return null;
};

export default useRoute;
