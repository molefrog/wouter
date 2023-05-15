/**
 * @jsx h
 * @jest-environment node
 */

import { h } from "preact";
import renderToString from "preact-render-to-string";

// make the library use Preact exports
jest.mock("../react-deps.js", () => require("../preact/react-deps.js"));
const { Route, Link, Switch, Router, useLocation } = require("../index.js");

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
