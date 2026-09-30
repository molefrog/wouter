import { expectTypeOf, test } from "bun:test";
import { Route, Router, useRoute, type Parser } from "wouter";
import type { Parser as PreactParser } from "wouter-preact";
import type { urlPatternParser as ReactURLPatternParser } from "wouter/url-pattern";
import type { urlPatternParser as PreactURLPatternParser } from "wouter-preact/url-pattern";

test("both package subpaths export a compatible URLPattern parser", () => {
  expectTypeOf<typeof ReactURLPatternParser>().toEqualTypeOf<Parser>();
  expectTypeOf<typeof PreactURLPatternParser>().toEqualTypeOf<PreactParser>();
});

test("custom parsers need only exec and may omit keys for named groups", () => {
  const parser: Parser = (route, loose) => ({
    pattern: {
      exec: (input) => new RegExp(route + (loose ? "" : "$")).exec(input),
    },
  });
  const preactParser: PreactParser = parser;
  expectTypeOf(preactParser).toEqualTypeOf<PreactParser>();
  <Router parser={parser}>Custom parser</Router>;
});

test("native URLPattern syntax accepts explicit parameter types", () => {
  <Route<{ id?: string }> path="/users{/:id}?">
    {({ id }) => {
      expectTypeOf(id).toEqualTypeOf<string | undefined>();
      return id ?? "All users";
    }}
  </Route>;
  const User = () => {
    const [matches, params] = useRoute<{ id: string }>("/users/:id(\\d+)");
    if (matches) expectTypeOf(params.id).toEqualTypeOf<string>();
    return null;
  };
  expectTypeOf(User).toBeFunction();
});
