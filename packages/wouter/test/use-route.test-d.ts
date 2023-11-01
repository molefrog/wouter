import { it, expectTypeOf, assertType } from "vitest";
import { useRoute } from "wouter";

it("should only accept strings", () => {
  // @ts-expect-error
  assertType(useRoute(Symbol()));
  // @ts-expect-error
  assertType(useRoute());
  assertType(useRoute("/"));
});

it('has a boolean "match" result as a first returned value', () => {
  const [match] = useRoute("/");
  expectTypeOf(match).toEqualTypeOf<boolean>();
});

it("returns null as parameters when there was no match", () => {
  const [match, params] = useRoute("/foo");

  if (!match) {
    expectTypeOf(params).toEqualTypeOf<null>();
  }
});

it("accepts the type of parameters as a generic argument", () => {
  const [match, params] = useRoute<{ id: string; name: string | undefined }>(
    "/app/users/:name?/:id"
  );

  if (match) {
    expectTypeOf(params).toEqualTypeOf<{
      id: string;
      name: string | undefined;
    }>();
  }
});

it("infers parameters from the route path", () => {
  const [, inferedParams] = useRoute("/app/users/:name?/:id/*?");

  if (inferedParams) {
    expectTypeOf(inferedParams).toMatchTypeOf<{
      name?: string;
      id: string;
      wildcard?: string;
    }>();
  }
});

it.todo("accepts custom parser type for parameter inference");
