import { currentPathname } from "./utils.js";

// Generates static `useLocation` hook. The hook always
// responds with initial path provided.
// You can use this for server-side rendering.
export default (path = "/", { record = false } = {}) => {
  const hook = ({ base = "" } = {}) => [
    currentPathname(base, path),
    (to, { replace } = {}) => {
      if (record) {
        if (replace) {
          hook.history.pop();
        }
        hook.history.push(
          // handle nested routers and absolute paths
          to[0] === "~" ? to.slice(1) : base + to
        );
      }
    }
  ];
  hook.history = [path];
  return hook;
};
