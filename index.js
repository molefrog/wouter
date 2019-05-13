import locationHook from "./use-location.js";
import makeMatcher from "./matcher.js";

import {
  useRef,
  useMemo,
  useContext,
  useCallback,
  createContext,
  isValidElement,
  cloneElement,
  createElement as h
} from "./react-deps.js";

/*
 * Part 1, Hooks API: useRouter, useRoute and useLocation
 */

const RouterCtx = createContext();

export const buildRouter = (options = {}) => {
  return {
    hook: options.hook || locationHook,
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

export const useLocation = () => useRouter().hook();

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
  const { children, onClick } = props;

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

  // make sure the `children` prop is always an array
  // this is a bit hacky, because it returns [[]], in
  // case of an empty array, but this case should be
  // properly handled below in the loop.
  children = children && children.length ? children : [children];

  for (const element of children) {
    if (
      isValidElement(element) &&
      // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      element.props.path &&
      matcher(element.props.path, location || originalLocation)[0]
    )
      return cloneElement(element, { match: true });
  }

  return null;
};

export default useRoute;
