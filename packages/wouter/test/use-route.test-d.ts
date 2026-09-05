import { test, expectTypeOf } from "bun:test";
import { useRoute } from "../src/index.js";

const assertType = <T>(_value: T): void => {};

test("accepts string and regular expression patterns", () => {
  // @ts-expect-error
  assertType(useRoute(Symbol()));
  // @ts-expect-error
  assertType(useRoute());
  assertType(useRoute("/"));
  assertType(useRoute(/\/users\/(\d+)/));
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
      "*"?: string;
    }>();
  }
});

test("uses the runtime wildcard key in every position", () => {
  const [match, params] = useRoute("/files/*/edit");

  if (match) {
    expectTypeOf(params["*"]).toEqualTypeOf<string>();
    // @ts-expect-error middle wildcard captures are still named `*`
    params.wild;
  }

  const [, optional] = useRoute("/files/*?");
  if (optional) {
    expectTypeOf(optional["*"]).toEqualTypeOf<string | undefined>();
  }
});

test("extracts parameter names before file extensions", () => {
  const [, params] = useRoute("/files/:name.json/:version?.txt");

  if (params) {
    expectTypeOf(params.name).toEqualTypeOf<string>();
    expectTypeOf(params.version).toEqualTypeOf<string | undefined>();
    // @ts-expect-error the file extension is not part of the key
    params["name.json"];
  }
});

test("lets the last duplicate capture determine optionality", () => {
  const [, required] = useRoute("/:id?/:id");
  const [, optional] = useRoute("/:id/:id?");

  if (required) {
    expectTypeOf(required.id).toEqualTypeOf<string>();
  }
  if (optional) {
    expectTypeOf(optional.id).toEqualTypeOf<string | undefined>();
  }
});

test("ignores embedded colons and segments after an empty segment", () => {
  const [, params] = useRoute("/literal:name/:id//:ignored");

  if (params) {
    expectTypeOf(params.id).toEqualTypeOf<string>();
    // @ts-expect-error a colon must begin a segment to introduce a parameter
    params.name;
    // @ts-expect-error the parser stops at the empty segment
    params.ignored;
  }
});

test("returns optional string parameters for dynamic paths", () => {
  const path: string = "/users/:id";
  const [, params] = useRoute(path);

  if (params) {
    expectTypeOf(params.id).toEqualTypeOf<string | undefined>();
    expectTypeOf(params[0]).toEqualTypeOf<string | undefined>();
  }
});

test("distributes inferred parameters over route unions", () => {
  const pattern = Math.random() ? "/users/:id" : "/posts/:slug";
  const [, params] = useRoute(pattern);

  if (params && "id" in params) {
    expectTypeOf(params.id).toEqualTypeOf<string>();
    // @ts-expect-error the other route's parameter is not present
    params.slug;
  }
  if (params && "slug" in params) {
    expectTypeOf(params.slug).toEqualTypeOf<string>();
  }
});

test("accepts interface parameters without an index signature", () => {
  interface UserParams {
    id: string;
    name?: string;
  }

  const [match, params] = useRoute<UserParams>("/users/:id/:name?");
  if (match) {
    expectTypeOf(params).toEqualTypeOf<UserParams>();
  }
});

test("infers parameters from absolute route patterns", () => {
  const [match, params] = useRoute("~/app/users/:name?/:id");

  if (match) {
    expectTypeOf(params.id).toEqualTypeOf<string>();
    expectTypeOf(params.name).toEqualTypeOf<string | undefined>();
    expectTypeOf(params[0]).toEqualTypeOf<string | undefined>();
  } else {
    expectTypeOf(params).toEqualTypeOf<null>();
  }
});
