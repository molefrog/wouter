import React, { useRef, useMemo, useEffect, useState, useContext } from "react";

const RouterCtx = React.createContext();

export const buildRouter = (options = {}) => {
  return {
    history: options.history || {}
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
