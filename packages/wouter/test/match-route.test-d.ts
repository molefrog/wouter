import { test, expectTypeOf } from "bun:test";
import { matchRoute, useRouter } from "../src/index.js";

const assertType = <T,>(_value: T): void => {};
const { parser } = useRouter();

test("should only accept strings", () => {
  // @ts-expect-error
  assertType(matchRoute(parser, Symbol(), ""));
  // @ts-expect-error
  assertType(matchRoute(parser, undefined, ""));
  assertType(matchRoute(parser, "/", ""));
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
      wildcard?: string;
    }>();
  }
});
