import { expect, test } from "bun:test";
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { parse } from "regexparam";

import {
  Link,
  Route,
  Router,
  Switch,
  matchRoute,
  useLocation,
  useParams,
  useRoute,
  useRouter,
} from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";
import { urlPatternParser } from "wouter/url-pattern";
import { withoutLocation } from "./setup.js";

test("matches required, optional and constrained URLPattern parameters", () => {
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/:id", "/users/42")
  ).toStrictEqual([true, { id: "42" }]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/:id", "/users")
  ).toStrictEqual([false, null]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users{/:id}?", "/users")
  ).toStrictEqual([true, { id: undefined }]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users{/:id}?", "/users/42")
  ).toStrictEqual([true, { id: "42" }]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/:id(\\d+)", "/users/42")
  ).toStrictEqual([true, { id: "42" }]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/:id(\\d+)", "/users/alex")
  ).toStrictEqual([false, null]);
});

test("retains native named, wildcard and repeated groups", () => {
  expect<unknown>(
    matchRoute(urlPatternParser, "/:name/*", "/first/second/third")
  ).toStrictEqual([true, { 0: "second/third", name: "first" }]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/files/:parts+", "/files/a/b")
  ).toStrictEqual([true, { parts: "a/b" }]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/files/*", "/files/")
  ).toStrictEqual([true, { 0: "" }]);
});

test("keeps native case and trailing slash semantics", () => {
  expect<unknown>(
    matchRoute(urlPatternParser, "/users", "/Users")
  ).toStrictEqual([false, null]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users", "/users/")
  ).toStrictEqual([false, null]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/", "/users")
  ).toStrictEqual([false, null]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/", "/users/")
  ).toStrictEqual([true, {}]);
});

test.each([
  ["/users/:id", "/users/42/settings", { id: "42" }, "/users/42"],
  ["/users{/:id}?", "/users/42/settings", { id: "42" }, "/users/42"],
  ["/users{/:id}?", "/users", { id: undefined }, "/users"],
  ["/files/:parts+", "/files/a/b", { parts: "a/b" }, "/files/a/b"],
  ["/users/", "/users/settings", {}, "/users"],
  ["/users/", "/users//settings", {}, "/users/"],
  ["/users/", "/users/", {}, "/users"],
  ["/users//", "/users//settings", {}, "/users/"],
  ["/", "/users/42", {}, ""],
  ["/", "/", {}, ""],
  ["/:id?", "/", { id: undefined }, ""],
] as const)(
  "matches the longest slash-delimited prefix for nested %s at %s",
  (route, path, params, base) => {
    expect<unknown>(
      matchRoute(urlPatternParser, route, path, true)
    ).toStrictEqual([true, params, base]);
  }
);

test("loose matching respects boundaries without adding synthetic parameters", () => {
  expect<unknown>(
    matchRoute(urlPatternParser, "/users", "/users-extra/settings", true)
  ).toStrictEqual([false, null]);
  expect<unknown>(
    matchRoute(
      urlPatternParser,
      "/users/:__wouter_rest",
      "/users/42/settings",
      true
    )
  ).toStrictEqual([true, { __wouter_rest: "42" }, "/users/42"]);
  expect<unknown>(
    matchRoute(urlPatternParser, "/users/:name", "/users/José/settings", true)
  ).toStrictEqual([true, { name: "Jos%C3%A9" }, "/users/José"]);
});

test("leaves the default parser and RegExp routes compatible", () => {
  expect<unknown>(matchRoute(parse, "/users/:id", "/Users/42/")).toStrictEqual([
    true,
    { 0: "42", id: "42" },
  ]);
  expect<unknown>(
    matchRoute(
      urlPatternParser,
      /^\/users\/(?<id>\d+)/,
      "/users/42/settings",
      true
    )
  ).toStrictEqual([true, { 0: "42", id: "42" }, "/users/42"]);
  const { result } = renderHook(() => useRouter().parser);
  expect(result.current).toBe(parse);
});

test("useRoute supports router bases, absolute escapes and navigation", () => {
  const { hook, navigate } = memoryLocation({ path: "/app/users/42" });
  const { result } = renderHook(
    () => [useRoute("/users/:id(\\d+)"), useRoute("~/app/users/:id")],
    {
      wrapper: ({ children }) => (
        <Router parser={urlPatternParser} base="/app" hook={hook}>
          {children}
        </Router>
      ),
    }
  );
  expect(result.current).toStrictEqual([
    [true, { id: "42" }],
    [true, { id: "42" }],
  ]);
  act(() => navigate("/app/users/alex"));
  expect(result.current).toStrictEqual([
    [false, null],
    [true, { id: "alex" }],
  ]);
});

test("Switch, inherited params and links work with nested URLPattern routes", () => {
  const { hook, navigate } = memoryLocation({ path: "/app/users/42/posts/7" });
  const Post = () => {
    const params = useParams<{ id: string; post: string }>();
    const [path] = useLocation();
    return (
      <>
        <span>{`${params.id}:${params.post}:${useRouter().base}:${path}`}</span>
        <Link href="/posts/8">Next</Link>
        <Link href="~/outside">Outside</Link>
      </>
    );
  };
  const { container } = render(
    <Router parser={urlPatternParser} base="/app" hook={hook}>
      <Switch>
        <Route path="/about">About</Route>
        <Route path={"/users/:id(\\d+)"} nest>
          <Route path="/posts/:post">
            <Post />
          </Route>
        </Route>
        <Route>Fallback</Route>
      </Switch>
    </Router>
  );
  expect(container.querySelector("span")?.textContent).toBe(
    "42:7:/app/users/42:/posts/7"
  );
  const [next, outside] = Array.from(container.querySelectorAll("a"));
  expect(next.getAttribute("href")).toBe("/app/users/42/posts/8");
  expect(outside.getAttribute("href")).toBe("/outside");
  fireEvent.click(next);
  expect(container.querySelector("span")?.textContent).toBe(
    "42:8:/app/users/42:/posts/8"
  );
  fireEvent.click(outside);
  expect(container.textContent).toBe("Fallback");
  act(() => navigate("/app/about"));
  expect(container.textContent).toBe("About");
});

test("root and trailing slash nesting leave the child pathname intact in SSR", () => {
  const rendered = withoutLocation(() =>
    renderToStaticMarkup(
      <Router parser={urlPatternParser} ssrPath="/users/42">
        <Route path="/" nest>
          <Route path="/users/" nest>
            <Route<{ id: string }> path={"/:id(\\d+)"}>
              {({ id }) => `User ${id}`}
            </Route>
          </Route>
        </Route>
      </Router>
    )
  );
  expect(rendered).toBe("User 42");
});
