import { renderHook, act } from "@testing-library/react";
import { useRoute, Match, Router, RegexRouteParams } from "../src/index.js";
import { it, expect } from "bun:test";
import { memoryLocation } from "../src/memory-location.js";

it("is case insensitive", () => {
  assertRoute("/Users", "/users", {});
  assertRoute("/HomePage", "/Homepage", {});
  assertRoute("/Users/:Name", "/users/alex", { 0: "alex", Name: "alex" });
});

it("supports required segments", () => {
  assertRoute("/:page", "/users", { 0: "users", page: "users" });
  assertRoute("/:page", "/users/all", false);
  assertRoute("/:page", "/1", { 0: "1", page: "1" });

  assertRoute("/home/:page/etc", "/home/users/etc", {
    0: "users",
    page: "users",
  });
  assertRoute("/home/:page/etc", "/home/etc", false);

  assertRoute(
    "/root/payments/:id/refunds/:refId",
    "/root/payments/1/refunds/2",
    [true, { 0: "1", 1: "2", id: "1", refId: "2" }]
  );
});

it("ignores the trailing slash", () => {
  assertRoute("/home", "/home/", {});
  assertRoute("/home", "/home", {});

  assertRoute("/home/", "/home/", {});
  assertRoute("/home/", "/home", {});

  assertRoute("/:page", "/users/", [true, { 0: "users", page: "users" }]);
  assertRoute("/catalog/:section?", "/catalog/", {
    0: undefined,
    section: undefined,
  });
});

it("supports trailing wildcards", () => {
  assertRoute("/app/*", "/app/", { 0: "", "*": "" });
  assertRoute("/app/*", "/app/dashboard/intro", {
    0: "dashboard/intro",
    "*": "dashboard/intro",
  });
  assertRoute("/app/*", "/app/charges/1", { 0: "charges/1", "*": "charges/1" });
});

it("supports wildcards in the middle of the pattern", () => {
  assertRoute("/app/*/settings", "/app/users/settings", {
    0: "users",
    "*": "users",
  });
  assertRoute("/app/*/settings", "/app/users/1/settings", {
    0: "users/1",
    "*": "users/1",
  });

  assertRoute("/*/payments/:id", "/home/payments/1", {
    0: "home",
    1: "1",
    "*": "home",
    id: "1",
  });
  assertRoute("/*/payments/:id?", "/home/payments", {
    0: "home",
    1: undefined,
    "*": "home",
    id: undefined,
  });
});

it("uses a question mark to define optional segments", () => {
  assertRoute("/books/:genre/:title?", "/books/scifi", {
    0: "scifi",
    1: undefined,
    genre: "scifi",
    title: undefined,
  });
  assertRoute("/books/:genre/:title?", "/books/scifi/dune", {
    0: "scifi",
    1: "dune",
    genre: "scifi",
    title: "dune",
  });
  assertRoute("/books/:genre/:title?", "/books/scifi/dune/all", false);

  assertRoute("/app/:company?/blog/:post", "/app/apple/blog/mac", {
    0: "apple",
    1: "mac",
    company: "apple",
    post: "mac",
  });

  assertRoute("/app/:company?/blog/:post", "/app/blog/mac", {
    0: undefined,
    1: "mac",
    company: undefined,
    post: "mac",
  });
});

it("supports optional wildcards", () => {
  assertRoute("/app/*?", "/app/blog/mac", { 0: "blog/mac", "*": "blog/mac" });
  assertRoute("/app/*?", "/app", { 0: undefined, "*": undefined });
  assertRoute("/app/*?/dashboard", "/app/v1/dashboard", { 0: "v1", "*": "v1" });
  assertRoute("/app/*?/dashboard", "/app/dashboard", {
    0: undefined,
    "*": undefined,
  });
  assertRoute("/app/*?/users/:name", "/app/users/karen", {
    0: undefined,
    1: "karen",
    "*": undefined,
    name: "karen",
  });
});

it("supports other characters in segments", () => {
  assertRoute("/users/:name", "/users/1-alex", { 0: "1-alex", name: "1-alex" });
  assertRoute("/staff/:name/:bio?", "/staff/John Doe 3", {
    0: "John Doe 3",
    1: undefined,
    name: "John Doe 3",
    bio: undefined,
  });
  assertRoute("/staff/:name/:bio?", "/staff/John Doe 3/bio", {
    0: "John Doe 3",
    1: "bio",
    name: "John Doe 3",
    bio: "bio",
  });

  assertRoute("/users/:name/bio", "/users/$102_Kathrine&/bio", {
    0: "$102_Kathrine&",
    name: "$102_Kathrine&",
  });
});

it("ignores escaped slashes", () => {
  assertRoute("/:param/bar", "/foo%2Fbar/bar", {
    0: "foo%2Fbar",
    param: "foo%2Fbar",
  });
  assertRoute("/:param", "/foo%2Fbar%D1%81%D0%B0%D0%BD%D1%8F", {
    0: "foo%2Fbarсаня",
    param: "foo%2Fbarсаня",
  });
});

it("supports regex patterns", () => {
  assertRoute(/[/]foo/, "/foo", {});
  assertRoute(/[/]([a-z]+)/, "/bar", { 0: "bar" });
  assertRoute(/[/]([a-z]+)/, "/123", false);
  assertRoute(/[/](?<param>[a-z]+)/, "/bar", { 0: "bar", param: "bar" });
  assertRoute(/[/](?<param>[a-z]+)/, "/123", false);
});

it("reacts to pattern updates", () => {
  const { result, rerender } = renderHook(
    ({ pattern }: { pattern: string }) => useRoute(pattern),
    {
      wrapper: (props) => (
        <Router
          hook={
            memoryLocation({ path: "/blog/products/40/read-all", static: true })
              .hook
          }
          {...props}
        />
      ),
      initialProps: { pattern: "/" },
    }
  );

  expect(result.current).toStrictEqual([false, null]);

  rerender({ pattern: "/blog/:category/:post/:action" });
  expect(result.current).toStrictEqual([
    true,
    {
      0: "products",
      1: "40",
      2: "read-all",
      category: "products",
      post: "40",
      action: "read-all",
    } as any,
  ]);

  rerender({ pattern: "/blog/products/:id?/read-all" });
  expect(result.current).toStrictEqual([true, { 0: "40", id: "40" } as any]);

  rerender({ pattern: "/blog/products/:name" });
  expect(result.current).toStrictEqual([false, null]);

  rerender({ pattern: "/blog/*" });
  expect(result.current).toStrictEqual([
    true,
    { 0: "products/40/read-all", "*": "products/40/read-all" } as any,
  ]);
});

it("reacts to location updates", () => {
  const { hook, navigate } = memoryLocation();

  const { result } = renderHook(() => useRoute("/cities/:city?"), {
    wrapper: (props) => <Router hook={hook} {...props} />,
  });

  expect(result.current).toStrictEqual([false, null]);

  act(() => navigate("/cities/berlin"));
  expect(result.current).toStrictEqual([true, { 0: "berlin", city: "berlin" }]);

  act(() => navigate("/cities/Tokyo"));
  expect(result.current).toStrictEqual([true, { 0: "Tokyo", city: "Tokyo" }]);

  act(() => navigate("/about"));
  expect(result.current).toStrictEqual([false, null]);

  act(() => navigate("/cities"));
  expect(result.current).toStrictEqual([
    true,
    { 0: undefined, city: undefined },
  ]);
});

/**
 * Assertion helper to test useRoute() return values.
 */

const assertRoute = (
  pattern: string | RegExp,
  location: string,
  rhs: false | Match | Record<string, string | undefined>
) => {
  const { result } = renderHook(() => useRoute(pattern), {
    wrapper: (props) => (
      <Router
        hook={memoryLocation({ path: location, static: true }).hook}
        {...props}
      />
    ),
  });

  if (rhs === false) {
    expect(result.current).toStrictEqual([false, null]);
  } else if (Array.isArray(rhs)) {
    expect(result.current).toStrictEqual(rhs);
  } else {
    expect(result.current).toStrictEqual([true, rhs]);
  }
};
