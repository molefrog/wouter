const memoryHistory = path => {
  let listeners = {};
  let id = -1;

  return {
    path: () => path,
    push: to => Object.values(listeners).forEach(cb => cb((path = to))),
    subscribe: cb => {
      listeners[++id] = cb;
      return () => delete listeners[id];
    }
  };
};

module.exports = memoryHistory;
