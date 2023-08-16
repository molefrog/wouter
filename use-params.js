import { createContext, createElement as h, useContext } from "./react-deps.js";

const defaultParams = {
  // Default to empty
  params: {},
};
export const ParamsCtx = createContext(defaultParams);

// Helper to wrap children component inside the provider
export const ParamsWrapper = (params, children) =>
  h(ParamsCtx.Provider, {
    value: { params },
    children,
  });

export const useParams = () => useContext(ParamsCtx).params;
