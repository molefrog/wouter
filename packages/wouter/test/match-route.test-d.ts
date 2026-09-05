import { test, expectTypeOf } from "bun:test";
import { matchRoute, useRouter } from "../src/index.js";

const assertType = <T>(_value: T): void => {};
const { parser } = useRouter();

test("accepts string and regular expression patterns", () => {
  // @ts-expect-error
  assertType(matchRoute(parser, Symbol(), ""));
  // @ts-expect-error
  assertType(matchRoute(parser, undefined, ""));
  assertType(matchRoute(parser, "/", ""));
  assertType(matchRoute(parser, /\/users\/(\d+)/, ""));
});

test('has a boolean "match" result as a first returned value', () => {
  const [match] = matchRoute(parser, "/", "");
  expectTypeOf(match).toEqualTypeOf<boolean>();
});

test("returns null as parameters when there was no match", () => {
  const [match, params] = matchRoute(parser, "/foo", "");

  if (!match) {
    expectTypeOf(params).toEqualTypeOf<null>();
  }
});

test("accepts the type of parameters as a generic argument", () => {
  const [match, params] = matchRoute<{ id: string; name: string | undefined }>(
    parser,
    "/app/users/:name?/:id",
    ""
  );

  if (match) {
    expectTypeOf(params).toEqualTypeOf<{
      id: string;
      name: string | undefined;
    }>();
  }
});

test("infers parameters from the route path", () => {
  const [, inferedParams] = matchRoute(parser, "/app/users/:name?/:id/*?", "");

  if (inferedParams) {
    expectTypeOf(inferedParams).toMatchTypeOf<{
      0?: string;
      1?: string;
      2?: string;
      name?: string;
      id: string;
      "*"?: string;
    }>();
  }
});

test("returns the matched base only for a successful loose match", () => {
  const result = matchRoute(parser, "/users/:id", "/users/123/edit", true);

  if (result[0]) {
    expectTypeOf(result[1].id).toEqualTypeOf<string>();
    expectTypeOf(result[2]).toEqualTypeOf<string>();
    expectTypeOf(result.length).toEqualTypeOf<3>();
  } else {
    expectTypeOf(result).toEqualTypeOf<[false, null, undefined?]>();
    expectTypeOf(result[2]).toEqualTypeOf<undefined>();
  }
});

test("narrows a destructured loose match and its base together", () => {
  const [matched, params, base] = matchRoute(
    parser,
    "/users/:id",
    "/users/123/edit",
    true
  );

  if (matched) {
    expectTypeOf(params.id).toEqualTypeOf<string>();
    expectTypeOf(base).toEqualTypeOf<string>();
  } else {
    expectTypeOf(params).toEqualTypeOf<null>();
    expectTypeOf(base).toEqualTypeOf<undefined>();
  }
});

test("strict matches have exactly two tuple elements", () => {
  const omitted = matchRoute(parser, "/users/:id", "/users/123");
  const explicit = matchRoute(parser, "/users/:id", "/users/123", false);

  expectTypeOf(omitted.length).toEqualTypeOf<2>();
  expectTypeOf(explicit.length).toEqualTypeOf<2>();
  // @ts-expect-error strict matches have no base tuple element
  omitted[2];
  // @ts-expect-error strict matches have no base tuple element
  explicit[2];
});

test("handles a dynamic loose option", () => {
  const loose: boolean = Math.random() > 0.5;
  const result = matchRoute(parser, "/users/:id", "/users/123", loose);

  if (result[0]) {
    expectTypeOf(result[1].id).toEqualTypeOf<string>();
    expectTypeOf(result[2]).toEqualTypeOf<string | undefined>();
  } else {
    expectTypeOf(result).toEqualTypeOf<[false, null, undefined?]>();
    expectTypeOf(result[2]).toEqualTypeOf<undefined>();
  }

  const optional: boolean | undefined = Math.random() > 0.5 ? loose : undefined;
  const optionalResult = matchRoute(
    parser,
    "/users/:id",
    "/users/123",
    optional
  );
  if (optionalResult[0]) {
    expectTypeOf(optionalResult[2]).toEqualTypeOf<string | undefined>();
  }

  const [matched, params, base] = matchRoute(
    parser,
    "/users/:id",
    "/users/123",
    loose
  );
  if (matched) {
    expectTypeOf(params.id).toEqualTypeOf<string>();
    expectTypeOf(base).toEqualTypeOf<string | undefined>();
  } else {
    expectTypeOf(params).toEqualTypeOf<null>();
    expectTypeOf(base).toEqualTypeOf<undefined>();
  }
});

test("treats an empty pattern as a catch-all", () => {
  const [, params] = matchRoute(parser, "", "/anything");

  if (params) {
    expectTypeOf(params["*"]).toEqualTypeOf<string>();
  }
});

test("accepts interface parameters for strict and loose matches", () => {
  interface UserParams {
    id: string;
  }

  const strict = matchRoute<UserParams>(parser, "/users/:id", "/users/123");
  const loose = matchRoute<UserParams>(
    parser,
    "/users/:id",
    "/users/123",
    true
  );

  if (strict[0]) {
    expectTypeOf(strict[1]).toEqualTypeOf<UserParams>();
  }
  if (loose[0]) {
    expectTypeOf(loose[1]).toEqualTypeOf<UserParams>();
    expectTypeOf(loose[2]).toEqualTypeOf<string>();
  }
});
