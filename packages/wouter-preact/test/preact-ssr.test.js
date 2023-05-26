/**
 * @jsx h
 * @jest-environment node
 */

import { h } from "preact";
import renderToString from "preact-render-to-string";

import { Route, Link, Switch, Router, useLocation } from "..";

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
