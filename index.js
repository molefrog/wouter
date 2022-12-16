import locationHook from "./use-location.js";
import matcherWithCache from "./matcher.js";

import {
  useContext,
  createContext,
  isValidElement,
  cloneElement,
  createElement as h,
  Fragment,
  useState,
  forwardRef,
  useIsomorphicLayoutEffect,
  useEvent,
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

const _useLocation = (router) => router.hook(router);

export const useLocation = () => _useLocation(useRouter());

export const useRoute = (pattern) => {
  const router = useRouter();
  // avoid inadvertently calling useRouter twice:
  const [path] = _useLocation(router);
  return router.matcher(pattern, path);
};

/*
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

export const Router = ({ hook, matcher, base = "", parent, children }) => {
  // updates the current router with the props passed down to the component
  const updateRouter = (router, proto = parent || defaultRouter) => {
    router.hook = hook || proto.hook;
    router.matcher = matcher || proto.matcher;
    router.base = proto.base + base;

    // store reference to parent router
    router.parent = parent;

    return router;
  };

  // we use `useState` here, but it only catches the first render and never changes.
  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  const [value] = useState(() => updateRouter({})); // create the object once...
  useIsomorphicLayoutEffect(() => {
    updateRouter(value);
  }); // ...then update it on each render

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
  const router = useRouter();
  const [, navigate] = _useLocation(router);

  const { to, href = to, children, onClick } = props;

  const handleClick = useEvent((event) => {
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
      navigate(to || href, props);
    }
  });

  // wraps children in `a` if needed
  const extraProps = {
    // handle nested routers and absolute paths
    href: href[0] === "~" ? href.slice(1) : router.base + href,
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
  const router = useRouter(),
    matcher = router.matcher;
  const [originalLocation] = _useLocation(router);

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
  const { to, href = to } = props;
  const [, navigate] = useLocation();
  const redirect = useEvent(() => navigate(to || href, props));

  // redirect is guaranteed to be stable since it is returned from useEvent
  useIsomorphicLayoutEffect(() => {
    redirect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default useRoute;
