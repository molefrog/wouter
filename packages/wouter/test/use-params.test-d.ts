import { it, expectTypeOf } from "vitest";
import { useParams } from "wouter";

it("does not accept any arguments", () => {
  expectTypeOf<typeof useParams>().parameters.toEqualTypeOf<[]>();
});

it("returns an object with arbitrary parameters", () => {
  const params = useParams();

  expectTypeOf(params).toBeObject();
  expectTypeOf(params.any).toEqualTypeOf<string | undefined>();
});

it("can infer the type of parameters from the route path", () => {
  const params = useParams<"/app/users/:name?/:id">();

  expectTypeOf(params).toMatchTypeOf<{ id: string; name?: string }>();
});

it("can accept the custom type of parameters as a generic argument", () => {
  const params = useParams<{ foo: number; bar?: string }>();

  expectTypeOf(params).toMatchTypeOf<{
    foo: number;
    bar?: string;
  }>();

  //@ts-expect-error
  return params.notFound;
});
