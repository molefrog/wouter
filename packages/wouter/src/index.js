import { parse as parsePattern } from "regexparam";

import { useLocation as locationHook } from "./use-location.js";

import {
  useRef,
  useState,
  useContext,
  createContext,
  isValidElement,
  cloneElement,
  createElement as h,
  Fragment,
  forwardRef,
  useIsomorphicLayoutEffect,
  useEvent,
} from "./react-deps.js";

/*
 * Router and router context. Router is a lightweight object that represents the current
 * routing options: how location is managed, base path etc.
 *
 * There is a default router present for most of the use cases, however it can be overridden
 * via the <Router /> component.
 */

const defaultRouter = {
  hook: locationHook,
  parser: parsePattern,
  base: "",
  // this option is used to override the current location during SSR
  ssrPath: undefined,
};

const RouterCtx = createContext(defaultRouter);

// gets the closest parent router from the context
export const useRouter = () => useContext(RouterCtx);

/*
 * Part 1, Hooks API: useRoute and useLocation
 */

// Internal version of useLocation to avoid redundant useRouter calls
const useLocationFromRouter = (router) => router.hook(router);

export const useLocation = () => useLocationFromRouter(useRouter());

const matchRoute = (router, route) => {
  const { pattern, keys } = router.parser(route);

  return (path) => {
    const matches = pattern.exec(path);

    return matches
      ? [true, Object.fromEntries(keys.map((key, i) => [key, matches[i + 1]]))] // convert to object
      : [false, null]; //  no match
  };
};

export const useRoute = (pattern) => {
  const [location] = useLocation();
  const router = useRouter();

  return pattern ? matchRoute(router, pattern)(location) : [true, {}];
};

/*a
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

export const Router = (props) => {
  const { hook, children } = props;

  // the router we will inherit from - it is the closest router in the tree,
  // unless the custom `hook` is provided (in that case it's the default one)
  const parent_ = useRouter();
  const parent = hook ? defaultRouter : parent_;

  // holds the reference to the router object provided to the context
  let router = parent;

  // this is needed for caching
  let ref = useRef({}),
    prev = ref.current,
    next = prev;

  for (let [k, v] of Object.entries(parent)) {
    const option =
      k === "base"
        ? /* base is special case, it is appended to the parent's base */
          v + (props[k] || "")
        : props[k] || v;

    if (prev === next && option !== next[k]) {
      ref.current = next = Object.assign({}, next);
    }

    next[k] = option;

    // the new router is no different from the parent, use parent
    if (option !== parent[k]) router = next;
  }

  return h(RouterCtx.Provider, {
    value: router,
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
  const [, navigate] = useLocationFromRouter(router);

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
  const router = useRouter();
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
        ? matchRoute(router, element.props.path)(location || originalLocation)
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
