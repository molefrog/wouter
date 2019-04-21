// creates a static history object, which is a
// wrapper around a read-only path.
// Can be used for Server-Side Rendering.
const staticHistory = (path = "/") => ({
  path: () => path,
  push: () => null,
  subscribe: () => () => null
});

module.exports = staticHistory;
