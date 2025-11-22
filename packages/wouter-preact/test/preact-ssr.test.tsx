import renderToString from "preact-render-to-string";
import { test, expect, describe } from "bun:test";
import { Router, useLocation } from "../src/index.js";

describe("Preact SSR", () => {
  test("supports SSR", () => {
    const LocationPrinter = () => <>location = {useLocation()[0]}</>;

    const rendered = renderToString(
      <Router ssrPath="/ssr/preact">
        <LocationPrinter />
      </Router>
    );

    expect(rendered).toBe("location = /ssr/preact");
  });
});
