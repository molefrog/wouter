import { test, expectTypeOf } from "bun:test";
import { useRoute } from "../src/index.js";

const assertType = <T,>(_value: T): void => {};

test("should only accept strings", () => {
  // @ts-expect-error
  assertType(useRoute(Symbol()));
  // @ts-expect-error
  assertType(useRoute());
  assertType(useRoute("/"));
});

test('has a boolean "match" result as a first returned value', () => {
  const [match] = useRoute("/");
  expectTypeOf(match).toEqualTypeOf<boolean>();
});

test("returns null as parameters when there was no match", () => {
  const [match, params] = useRoute("/foo");

  if (!match) {
    expectTypeOf(params).toEqualTypeOf<null>();
  }
});

test("accepts the type of parameters as a generic argument", () => {
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

test("infers parameters from the route path", () => {
  const [, inferedParams] = useRoute("/app/users/:name?/:id/*?");

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
