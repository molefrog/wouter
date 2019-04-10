import makeHistory from "../history";

it("is a wrapper around History API", () => {
  const history = makeHistory();

  window.history.pushState({}, null, "/users");
  expect(history.path()).toBe("/users");
});

describe("`subscribe()` method", () => {
  it("allows to subscribe to path changes", () => {
    const history = makeHistory();
    const mockFn = jest.fn();

    const unsub = history.subscribe(mockFn);

    history.push("/about");
    expect(mockFn).toHaveBeenCalledWith("/about");
    unsub();
  });

  it("returns a function for unsubscribing", () => {
    const history = makeHistory();
    const mockFn = jest.fn();

    const unsub = history.subscribe(mockFn);

    expect(unsub).toBeInstanceOf(Function);
    unsub();
    history.push("/something");
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("reacts on `pushState` / `replaceState`", () => {
    const history = makeHistory();
    const mockFn = jest.fn();

    const unsub = history.subscribe(mockFn);

    window.history.pushState({}, null, "/something");
    window.history.replaceState({}, null, "/something-else");

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
