const staticHistory = path => ({
  path: () => path,
  push: () => null,
  subscribe: () => () => null
});

module.exports = staticHistory;
