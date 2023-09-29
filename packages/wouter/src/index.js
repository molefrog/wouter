import { parse as parsePattern } from "regexparam";

import { useBrowserLocation } from "./use-browser-location.js";

import {
  useRef,
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
  hook: useBrowserLocation,
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

const matchRoute = (parser, route, path, loose) => {
  if (!route) return [true, {}];

  const { pattern, keys } = parser(route, loose);
  const [$base, ...matches] = pattern.exec(path) || [];

  return $base
    ? [
        true,
        keys.reduce((prm, k, i) => (prm[k] = matches[i] && prm), { $base }),
      ]
    : [false, null];
};

export const useRoute = (pattern) =>
  matchRoute(useRouter().parser, pattern, useLocation()[0]);

/*
 * Part 2, Low Carb Router API: Router, Route, Link, Switch
 */

export const Router = ({ children, ...props }) => {
  // the router we will inherit from - it is the closest router in the tree,
  // unless the custom `hook` is provided (in that case it's the default one)
  const parent_ = useRouter();
  const parent = props.hook ? defaultRouter : parent_;

  // holds to the context value: the router object
  let value = parent;

  // what is happening below: to avoid unnecessary rerenders in child components,
  // we ensure that the router object reference is stable, unless there are any
  // changes that require reload (e.g. `base` prop changes -> all components that
  // get the router from the context should rerender, even if the component is memoized).
  // the expected behaviour is:
  //
  //   1) when the resulted router is no different from the parent, use parent
  //   2) if the custom `hook` prop is provided, we always inherit from the
  //      default router instead. this resets all previously overridden options.
  //   3) when the router is customized here, it should stay stable between renders
  let ref = useRef({}),
    prev = ref.current,
    next = prev;

  for (let k in parent) {
    const option =
      k === "base"
        ? /* base is special case, it is appended to the parent's base */
          parent[k] + (props[k] || "")
        : props[k] || parent[k];

    if (prev === next && option !== next[k]) {
      ref.current = next = { ...next };
    }

    next[k] = option;

    // the new router is no different from the parent, use parent
    if (option !== parent[k]) value = next;
  }

  return h(RouterCtx.Provider, { value, children });
};

const h_route = ({ children, component }, params) => {
  // React-Router style `component` prop
  if (component) return h(component, { params });

  // support render prop or plain children
  return typeof children === "function" ? children(params) : children;
};

export const Route = ({ path, nest, match, ...renderProps }) => {
  const router = useRouter();
  const [location] = useLocationFromRouter(router);

  const [matches, params_] =
    match ?? matchRoute(router.parser, path, location, nest);

  if (!matches) return null;
  const { base, ...params } = params_;

  return base
    ? h(Router, { base }, h_route(renderProps, params))
    : h_route(renderProps, params);
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
      (match = matchRoute(
        router.parser,
        element.props.path,
        location || originalLocation,
        element.props.nest
      ))[0]
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
