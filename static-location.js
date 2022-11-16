import { currentPathname } from "./utils.js";

// Generates static `useLocation` hook. The hook always
// responds with initial path provided.
// You can use this for server-side rendering.
export default (path = "/", { base = "", record = false } = {}) => {
  let hook;
  const navigate = (to, { replace } = {}) => {
    if (record) {
      if (replace) {
        hook.history.pop();
      }
      // handle nested routers and absolute paths
      hook.history.push(to[0] === "~" ? to.slice(1) : base + to);
    }
  };
  hook = () => [currentPathname(path), navigate];
  hook.history = [path];
  return hook;
};
