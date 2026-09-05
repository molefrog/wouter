import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import {
  Link,
  Redirect,
  Router,
  useLocation,
  useSearch,
  type SsrContext,
} from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

function Location() {
  const [path] = useLocation();
  const search = useSearch();
  return h("p", null, `${path}?${search}`);
}

const context: SsrContext = {};

console.log(
  JSON.stringify({
    browserGlobals: [
      typeof window,
      typeof document,
      typeof location,
      typeof history,
    ],
    browser: renderToString(
      h(Router, {
        ssrPath: "/ssr/react?from=path",
        children: h(Location),
      })
    ),
    hash: renderToString(
      h(Router, {
        hook: useHashLocation,
        ssrPath: "/ssr/hash",
        ssrSearch: "?from=hash",
        children: h(Location),
      })
    ),
    link: renderToString(
      h(Router, {
        ssrPath: "/",
        children: h(Link, { href: "/about" }, "About"),
      })
    ),
    redirect: renderToString(
      h(Router, {
        ssrPath: "/",
        ssrContext: context,
        children: h(Redirect, { to: "/about" }),
      })
    ),
    context,
  })
);
