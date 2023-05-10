// Unfortunately we cannot import these from use-location, because
// that will also pull in react, use-sync-external-store, and then
// monkeypatch `history` *again* in the generated build files!
const relativePath = (base = "", path = location.pathname) =>
  !path.toLowerCase().indexOf(base.toLowerCase())
    ? path.slice(base.length) || "/"
    : "~" + path;

const absolutePath = (to, base = "") =>
  to[0] === "~" ? to.slice(1) : base + to;

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
