import { test, expectTypeOf } from "bun:test";
import { useParams } from "../src/index.js";

test("does not accept any arguments", () => {
  expectTypeOf<typeof useParams>().parameters.toEqualTypeOf<[]>();
});

test("returns an object with arbitrary parameters", () => {
  const params = useParams();

  expectTypeOf(params).toBeObject();
  expectTypeOf(params.any).toEqualTypeOf<string | undefined>();
  expectTypeOf(params[0]).toEqualTypeOf<string | undefined>();
});

test("can infer the type of parameters from the route path", () => {
  const params = useParams<"/app/users/:name?/:id">();

  expectTypeOf(params).toMatchTypeOf<{
    0?: string;
    1?: string;
    id: string;
    name?: string;
  }>();
});

test("can accept the custom type of parameters as a generic argument", () => {
  const params = useParams<{ foo: number; bar?: string }>();

  expectTypeOf(params).toMatchTypeOf<{
    foo: number;
    bar?: string;
  }>();

  //@ts-expect-error
  return params.notFound;
});
