import { renderHook, act } from "@testing-library/react";
import { useRoute, Match, Router } from "wouter";
import { it, expect } from "vitest";

import { staticLocation, memoryLocation } from "./test-utils";

it("is case insensitive", () => {
  assertRoute("/Users", "/users", {});
  assertRoute("/HomePage", "/Homepage", {});
  assertRoute("/Users/:Name", "/users/alex", { Name: "alex" });
});

it("supports required segments", () => {
  assertRoute("/:page", "/users", { page: "users" });
  assertRoute("/:page", "/users/all", false);
  assertRoute("/:page", "/1", { page: "1" });

  assertRoute("/home/:page/etc", "/home/users/etc", { page: "users" });
  assertRoute("/home/:page/etc", "/home/etc", false);

  assertRoute(
    "/root/payments/:id/refunds/:refId",
    "/root/payments/1/refunds/2",
    [true, { id: "1", refId: "2" }]
  );
});

it("ignores the trailing slash", () => {
  assertRoute("/home", "/home/", {});
  assertRoute("/home", "/home", {});

  assertRoute("/home/", "/home/", {});
  assertRoute("/home/", "/home", {});

  assertRoute("/:page", "/users/", [true, { page: "users" }]);
  assertRoute("/catalog/:section?", "/catalog/", { section: undefined });
});

it("supports trailing wildcards", () => {
  assertRoute("/app/*", "/app/", { wild: "" });
  assertRoute("/app/*", "/app/dashboard/intro", { wild: "dashboard/intro" });
  assertRoute("/app/*", "/app/charges/1", { wild: "charges/1" });
});

it("supports wildcards in the middle of the pattern", () => {
  assertRoute("/app/*/settings", "/app/users/settings", { wild: "users" });
  assertRoute("/app/*/settings", "/app/users/1/settings", { wild: "users/1" });

  assertRoute("/*/payments/:id", "/home/payments/1", { wild: "home", id: "1" });
  assertRoute("/*/payments/:id?", "/home/payments", {
    wild: "home",
    id: undefined,
  });
});

it("uses a question mark to define optional segments", () => {
  assertRoute("/books/:genre/:title?", "/books/scifi", {
    genre: "scifi",
    title: undefined,
  });
  assertRoute("/books/:genre/:title?", "/books/scifi/dune", {
    genre: "scifi",
    title: "dune",
  });
  assertRoute("/books/:genre/:title?", "/books/scifi/dune/all", false);

  assertRoute("/app/:company?/blog/:post", "/app/apple/blog/mac", {
    company: "apple",
    post: "mac",
  });

  assertRoute("/app/:company?/blog/:post", "/app/blog/mac", {
    company: undefined,
    post: "mac",
  });
});

it("supports other characters in segments", () => {
  assertRoute("/users/:name", "/users/1-alex", { name: "1-alex" });
  assertRoute("/staff/:name/:bio?", "/staff/John Doe 3", {
    name: "John Doe 3",
    bio: undefined,
  });
  assertRoute("/staff/:name/:bio?", "/staff/John Doe 3/bio", {
    name: "John Doe 3",
    bio: "bio",
  });

  assertRoute("/users/:name/bio", "/users/$102_Kathrine&/bio", {
    name: "$102_Kathrine&",
  });
});

it("reacts to pattern updates", () => {
  const { result, rerender } = renderHook(
    ({ pattern }: { pattern: string }) => useRoute(pattern),
    {
      wrapper: (props) => (
        <Router
          hook={staticLocation("/blog/products/40/read-all").hook}
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
    { category: "products", post: "40", action: "read-all" },
  ]);

  rerender({ pattern: "/blog/products/:id?/read-all" });
  expect(result.current).toStrictEqual([true, { id: "40" }]);

  rerender({ pattern: "/blog/products/:name" });
  expect(result.current).toStrictEqual([false, null]);

  rerender({ pattern: "/blog/*" });
  expect(result.current).toStrictEqual([
    true,
    { wild: "products/40/read-all" },
  ]);
});

it("reacts to location updates", () => {
  const { hook, navigate } = memoryLocation("/");

  const { result } = renderHook(() => useRoute("/cities/:city?"), {
    wrapper: (props) => <Router hook={hook} {...props} />,
  });

  expect(result.current).toStrictEqual([false, null]);

  act(() => navigate("/cities/berlin"));
  expect(result.current).toStrictEqual([true, { city: "berlin" }]);

  act(() => navigate("/cities/Tokyo"));
  expect(result.current).toStrictEqual([true, { city: "Tokyo" }]);

  act(() => navigate("/about"));
  expect(result.current).toStrictEqual([false, null]);

  act(() => navigate("/cities"));
  expect(result.current).toStrictEqual([true, { city: undefined }]);
});

/**
 * Assertion helper to test useRoute() return values.
 */

const assertRoute = (
  pattern: string,
  location: string,
  rhs: false | Match | Record<string, string | undefined>
) => {
  const { result } = renderHook(() => useRoute(pattern), {
    wrapper: (props) => (
      <Router hook={staticLocation(location).hook} {...props} />
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
