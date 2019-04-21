import memoryHistory from "../extra/memory-history";

describe("memoryHistory", () => {
  it("is initialized with path", () => {
    const history = memoryHistory("/foo");
    expect(history.path()).toBe("/foo");
  });

  it("allows to subscribe to change events", () => {
    const history = memoryHistory("/");

    const [fn1, fn2, fn3] = [jest.fn(), jest.fn(), jest.fn()];

    history.subscribe(fn1);
    history.subscribe(fn2);
    const unsub = history.subscribe(fn3);

    history.push("/pages");

    expect(fn1).toHaveBeenCalledWith("/pages");
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn3).toHaveBeenCalledTimes(1);

    unsub();

    fn3.mockClear();

    history.push("/about");

    expect(fn1).toHaveBeenCalled();
    expect(fn1).toHaveBeenCalled();
    expect(fn3).not.toHaveBeenCalled();
  });
});
