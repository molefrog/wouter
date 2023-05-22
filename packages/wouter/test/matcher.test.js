import createMatcher from "../matcher";

it("exports a factory function", () => {
  expect(createMatcher).toBeInstanceOf(Function);
});

describe("edge cases", () => {
  it("works for falsey patterns", () => {
    const match = createMatcher();

    expect(() => {
      match(null, "foo");
      match(undefined, "foo");
      match("", "foo");
    }).not.toThrow();
  });
});

describe("return values", () => {
  it("returns match success as a first arg", () => {
    const match = createMatcher();

    expect(match("/users", "/users")[0]).toBe(true);
    expect(match("/users", "/about")[0]).toBe(false);
  });
});

it("is case insensitive", () => {
  const match = createMatcher();
  expect(match("/Users", "/users")[0]).toBe(true);
});

it("always matches the entire path", () => {
  const match = createMatcher();
  expect(match("/users", "/users/12")[0]).toBe(false);
});

it("supports named segments", () => {
  const match = createMatcher();
  const [success, params] = match(
    "/orders/:id/items/:name",
    "/orders/12/items/carrot"
  );

  expect(success).toBe(true);
  expect(params).toMatchObject({ id: "12", name: "carrot" });
});

it("ignores a slash at the end", () => {
  const match = createMatcher();

  expect(match("/orders/new", "/orders/new")[0]).toBe(true);
  expect(match("/orders/new", "/orders/new/")[0]).toBe(true);
  expect(match("/orders/new/", "/orders/new/")[0]).toBe(true);

  // when trailing slash is explicitly specified, it is required!
  expect(match("/orders/new/", "/orders/new")[0]).toBe(false);
});

describe("additional segment modifiers", () => {
  it("an asterisk matches 0 or more groups", () => {
    const match = createMatcher();
    const ptr = "/u/:any*/rest";

    expect(match(ptr, "/u/foo/rest")).toMatchObject([true, { any: "foo" }]);
    expect(match(ptr, "/u/rest")).toMatchObject([true, { any: undefined }]);
    expect(match(ptr, "/u/foo/bar/baz/rest")).toMatchObject([
      true,
      { any: "foo/bar/baz" },
    ]);
  });

  it("a plus sign matches 1 or more groups", () => {
    const match = createMatcher();
    const ptr = "/u/:any+/rest";

    expect(match(ptr, "/u/foo/rest")).toMatchObject([true, { any: "foo" }]);
    expect(match(ptr, "/u/rest")).toMatchObject([false, null]);
    expect(match(ptr, "/u/foo/bar/baz/rest")).toMatchObject([
      true,
      { any: "foo/bar/baz" },
    ]);
  });

  it("a question mark matches 0 or 1 groups", () => {
    const match = createMatcher();
    const ptr = "/u/:any?/rest";

    expect(match(ptr, "/u/foo/rest")).toMatchObject([true, { any: "foo" }]);
    expect(match(ptr, "/u/rest")).toMatchObject([true, { any: undefined }]);
    expect(match(ptr, "/u/foo/bar/baz/rest")).toMatchObject([false, null]);
  });
});
