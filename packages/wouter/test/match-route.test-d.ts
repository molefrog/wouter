import { it, expectTypeOf, assertType } from "vitest";
import { matchRoute, useRouter } from "wouter";

const { parser } = useRouter();

it("should only accept strings", () => {
  // @ts-expect-error
  assertType(matchRoute(parser, Symbol(), ""));
  // @ts-expect-error
  assertType(matchRoute(parser, undefined, ""));
  assertType(matchRoute(parser, "/", ""));
});

it('has a boolean "match" result as a first returned value', () => {
  const [match] = matchRoute(parser, "/", "");
  expectTypeOf(match).toEqualTypeOf<boolean>();
});

it("returns null as parameters when there was no match", () => {
  const [match, params] = matchRoute(parser, "/foo", "");

  if (!match) {
    expectTypeOf(params).toEqualTypeOf<null>();
  }
});

it("accepts the type of parameters as a generic argument", () => {
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

it("infers parameters from the route path", () => {
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
