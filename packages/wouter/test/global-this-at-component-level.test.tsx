/**
 * @vitest-environment node
 */

import { test, expect, describe } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useSearch, useLocation, Router } from "wouter";

describe("useSearch", () => {
  test("works in node", () => {
    const App = () => {
      const search = useSearch();
      return <>{search}</>;
    };

    const rendered = renderToStaticMarkup(
      <Router ssrSearch="?foo=1">
        <App />
      </Router>
    );
    expect(rendered).toBe("foo=1");
  });

  test("works in node without options", () => {
    const App = () => {
      const search = useSearch();
      return <>search: {search}</>;
    };

    const rendered = renderToStaticMarkup(<App />);
    expect(rendered).toBe("search: ");
  });
});

test("useLocation works in node", () => {
  const App = () => {
    const [path] = useLocation();
    return <>{path}</>;
  };

  const rendered = renderToStaticMarkup(
    <Router ssrPath="/hello-from-server">
      <App />
    </Router>
  );
  expect(rendered).toBe("/hello-from-server");
});
