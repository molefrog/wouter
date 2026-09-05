import { h } from "preact";
import renderToString from "preact-render-to-string";
import { Router, useLocation, useSearch } from "wouter-preact";
import { useHashLocation } from "wouter-preact/use-hash-location";

function Location() {
  const [path] = useLocation();
  const search = useSearch();
  return h("p", null, `${path}?${search}`);
}

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
        ssrPath: "/ssr/preact?from=path",
        children: h(Location, null),
      })
    ),
    search: renderToString(
      h(Router, {
        ssrPath: "/ssr/search",
        ssrSearch: "?from=search",
        children: h(Location, null),
      })
    ),
    hash: renderToString(
      h(Router, {
        hook: useHashLocation,
        ssrPath: "/ssr/hash",
        ssrSearch: "?from=hash",
        children: h(Location, null),
      })
    ),
  })
);
