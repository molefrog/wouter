import locationHook from "./use-location.js";
import makeMatcher from "./matcher.js";

import {
  useRef,
  useEffect,
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

// one of the coolest features of `createContext`:
// when no value is provided — default object is used.
// allows us to use the router context as a global ref to store
// the implicitly created router (see `useRouter` below)
const RouterCtx = createContext({});

const buildRouter = (options = {}) => {
  return {
    hook: options.hook || locationHook,
    matcher: options.matcher || makeMatcher()
  };
};

export const useRouter = () => {
  const globalRef = useContext(RouterCtx);

  // either obtain the router from the outer context (provided by the
  // `<Router /> component) or create an implicit one on demand.
  return globalRef.v || (globalRef.v = buildRouter());
};

export const useLocation = () => {
  const router = useRouter();
  return router.hook(router);
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
  const value = ref.current || (ref.current = { v: buildRouter(props) });

  return h(RouterCtx.Provider, {
    value: value,
    children: props.children
  });
};

export const Route = ({ path, match, component, children }) => {
  const useRouteMatch = useRoute(path);

  // `props.match` is present - Route is controlled by the Switch
  const [matches, params] = match || useRouteMatch;

  if (!matches) return null;

  // React-Router style `component` prop
  if (component) return h(component, { params: params });

  // support render prop or plain children
  return typeof children === "function" ? children(params) : children;
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
    let match = 0;

    if (
      isValidElement(element) &&
      // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      element.props.path &&
      (match = matcher(element.props.path, location || originalLocation))[0]
    )
      return cloneElement(element, { match });
  }

  return null;
};

export const Redirect = props => {
  const [, push] = useLocation();
  useEffect(() => push(props.href || props.to));

  return null;
};

export default useRoute;
