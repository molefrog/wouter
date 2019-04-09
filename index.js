import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useContext,
  useCallback,
  createElement as h
} from "react";

// default history based on History API
import createHistory from "./history";

const RouterCtx = React.createContext();

export const buildRouter = (options = {}) => {
  const matchFn = (pattern, path) => {
    return [pattern === path, {}];
  };

  return {
    history: options.history || createHistory(),
    matchFn: options.matchFn || matchFn
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

  return (
    <RouterCtx.Provider value={getRouter()}>
      {props.children}
    </RouterCtx.Provider>
  );
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
