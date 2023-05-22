import { absolutePath, relativePath } from "./paths.js";

// Generates static `useLocation` hook. The hook always
// responds with initial path provided.
// You can use this for server-side rendering.
export default (path = "/", { record = false } = {}) => {
  console.warn(
    "`wouter/static-location` is deprecated and will be removed in upcoming versions. " +
      "If you want to use wouter in SSR mode, please use `ssrPath` option passed to the top-level " +
      "`<Router>` component."
  );

  const hook = ({ base = "" } = {}) => [
    relativePath(base, path),
    (to, { replace } = {}) => {
      if (record) {
        if (replace) {
          hook.history.pop();
        }
        hook.history.push(
          // handle nested routers and absolute paths
          absolutePath(to, base)
        );
      }
    },
  ];
  hook.history = [path];
  return hook;
};
