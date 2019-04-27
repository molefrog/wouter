import makeHistory from "./history";
import makeMatcher from "./matcher";

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
  const { children, path } = props;
  const [matches, params] = useRoute(props.path);

  if (!matches && !props.match) {
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
      if (props.onClick) {
        props.onClick();
      }
    },
    [href, props.onClick]
  );

  // wraps children in `a` if needed
  const extraProps = { href, onClick, to: null };
  const jsx = isValidElement(child) ? child : h("a", props);

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
  useEffect(() => router.history.push(prop.href || props.to));

  return null;
};

export default useRoute;
