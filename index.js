import React, { useRef, useMemo, useEffect, useState, useContext } from "react";

let globalRouter = null;
const RouterContext = React.createContext();

export const buildRouter = options => {
  return {
    push: () => {}
  };
};

export const Router = props => {
  const routerInst = useRef(() => buildRouter(props));

  return (
    <RouterContext.Provider value={routerInst}>
      {props.children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const providedRouter = useContext(RouterContext);

  const router = useMemo(
    () => (providedRouter ? providedRouter : buildRouter()),
    [providedRouter]
  );

  return router;
};
