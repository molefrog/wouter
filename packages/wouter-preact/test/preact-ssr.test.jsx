/**
 * @vitest-environment node
 */

import renderToString from "preact-render-to-string";
import { it, expect, describe } from "vitest";
import { Route, Link, Switch, Router, useLocation } from "wouter-preact";

describe("Preact SSR", () => {
  it("supports SSR", () => {
    const LocationPrinter = () => `location = ${useLocation()[0]}`;

    const rendered = renderToString(
      <Router ssrPath="/ssr/preact">
        <LocationPrinter />
      </Router>
    );

    expect(rendered).toBe("location = /ssr/preact");
  });
});
