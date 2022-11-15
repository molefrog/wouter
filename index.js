import locationHook from "./use-location.js";
import matcherWithCache from "./matcher.js";

import {
  useRef,
  useLayoutEffect,
  useContext,
  useCallback,
  createContext,
  isValidElement,
  cloneElement,
  createElement as h,
  Fragment,
  useState,
  forwardRef,
} from "./react-deps.js";

/*
 * Router and router context. Router is a lightweight object that represents the current
 * routing options: how location is managed, base path etc.
 *
 * There is a default router present for most of the use cases, however it can be overriden
 * via the <Router /> component.
 */

const defaultRouter = {
  hook: locationHook,
  matcher: matcherWithCache(),
  base: "",
};

const RouterCtx = createContext(defaultRouter);

// gets the closes parent router from the context
export const useRouter = () => useContext(RouterCtx);

/*
 * Part 1, Hooks API: useRoute and useLocation
 */

export const useLocation = () => {
  const router = useRouter();
  return router.hook(router);
};

export const useRoute = (pattern) => {
  const [path] = useLocation();
  return useRouter().matcher(pattern, path);
};

// internal hook used by Link and Redirect in order to perform navigation
const useNavigate = (options) => {
  const navRef = useRef();
  const [, navigate] = useLocation();

  navRef.current = () => navigate(options.to || options.href, options);
  return navRef;
};

/*
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

export const Router = ({
  hook,
  matcher,
  base = "",
  nested = false,
  children,
}) => {
  const parent = useRouter();

  // nested `<Router />` has the scope of its closest parent router (base path is prepended)
  // Routers are not nested by default, but this might change in future versions
  const proto = nested ? parent : defaultRouter;

  // this component doesn't handle prop updates, it is done intentionally to avoid unexpected
  // side effects (e.g. you can't just hot swap the hook, it'll break the routing)
  //
  // we use `useState` here, but it only catches the first render and never changes.
  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  const [value] = useState(() => ({
    hook: hook || proto.hook,
    matcher: matcher || proto.matcher,
    base: proto.base + base,
  }));

  return h(RouterCtx.Provider, {
    value,
    children,
  });
};

export const Route = ({ path, match, component, children }) => {
  const useRouteMatch = useRoute(path);

  // `props.match` is present - Route is controlled by the Switch
  const [matches, params] = match || useRouteMatch;

  if (!matches) return null;

  // React-Router style `component` prop
  if (component) return h(component, { params });

  // support render prop or plain children
  return typeof children === "function" ? children(params) : children;
};

export const Link = forwardRef((props, ref) => {
  const navRef = useNavigate(props);
  const { base } = useRouter();

  let { to, href = to, children, onClick } = props;

  const handleClick = useCallback(
    (event) => {
      // ignores the navigation when clicked using right mouse button or
      // by holding a special modifier key: ctrl, command, win, alt, shift
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button !== 0
      )
        return;

      onClick && onClick(event);
      if (!event.defaultPrevented) {
        event.preventDefault();
        navRef.current();
      }
    },
    // navRef is a ref so it never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClick]
  );

  // wraps children in `a` if needed
  const extraProps = {
    // handle nested routers and absolute paths
    href: href[0] === "~" ? href.slice(1) : base + href,
    onClick: handleClick,
    to: null,
    ref,
  };
  const jsx = isValidElement(children) ? children : h("a", props);

  return cloneElement(jsx, extraProps);
});

const flattenChildren = (children) => {
  return Array.isArray(children)
    ? [].concat(
        ...children.map((c) =>
          c && c.type === Fragment
            ? flattenChildren(c.props.children)
            : flattenChildren(c)
        )
      )
    : [children];
};

export const Switch = ({ children, location }) => {
  const { matcher } = useRouter();
  const [originalLocation] = useLocation();

  for (const element of flattenChildren(children)) {
    let match = 0;

    if (
      isValidElement(element) &&
      // we don't require an element to be of type Route,
      // but we do require it to contain a truthy `path` prop.
      // this allows to use different components that wrap Route
      // inside of a switch, for example <AnimatedRoute />.
      (match = element.props.path
        ? matcher(element.props.path, location || originalLocation)
        : [true, {}])[0]
    )
      return cloneElement(element, { match });
  }

  return null;
};

export const Redirect = (props) => {
  const navRef = useNavigate(props);

  // empty array means running the effect once, navRef is a ref so it never changes
  useLayoutEffect(() => {
    navRef.current();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default useRoute;
