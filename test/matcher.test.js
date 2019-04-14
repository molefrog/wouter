import createMatcher from "../matcher";

it("exports a factory function", () => {
  expect(createMatcher).toBeInstanceOf(Function);
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
