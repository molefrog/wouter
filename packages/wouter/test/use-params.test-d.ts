import { test, expectTypeOf } from "bun:test";
import { useParams, StringRouteParams } from "../src/index.js";

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

test("accepts interface parameters without an index signature", () => {
  interface UserParams {
    id: string;
    page?: number;
  }

  expectTypeOf(useParams<UserParams>()).toEqualTypeOf<UserParams>();
});

test("rejects primitives that are neither patterns nor parameter objects", () => {
  // @ts-expect-error a number cannot describe route parameters
  useParams<number>();
  // @ts-expect-error a boolean cannot describe route parameters
  useParams<boolean>();
  // @ts-expect-error null cannot describe route parameters
  useParams<null>();
  // @ts-expect-error void cannot describe route parameters
  useParams<void>();
});

test("accepts explicitly undefined optional capture values", () => {
  const params: StringRouteParams<"/:id?/*?"> = {
    id: undefined,
    "*": undefined,
  };

  expectTypeOf(params.id).toEqualTypeOf<string | undefined>();
  expectTypeOf(params["*"]).toEqualTypeOf<string | undefined>();
});

test("provides optional string values for an unspecified route string", () => {
  const params = useParams<string>();

  expectTypeOf(params.id).toEqualTypeOf<string | undefined>();
  expectTypeOf(params[0]).toEqualTypeOf<string | undefined>();
});

test("preserves regexparam's names for optional extension captures", () => {
  const params = useParams<"/files/:name.json?/:revision?.txt">();

  expectTypeOf(params["name.json"]).toEqualTypeOf<string | undefined>();
  expectTypeOf(params.revision).toEqualTypeOf<string | undefined>();
  // @ts-expect-error regexparam uses all text before `?` as the parameter name
  params.name;
});
