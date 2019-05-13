// Generates static `useLocation` hook. The hook always
// responds with initial path provided.
// You can use this for server-side rendering.
module.exports = (path = "/") => () => [path, x => x];
