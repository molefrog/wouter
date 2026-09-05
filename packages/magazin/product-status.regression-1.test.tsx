import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { Router } from "wouter";

import { App } from "./App";

// Regression: ISSUE-006 — missing product pages rendered as HTTP 200
// Found by /qa on 2026-09-05
// Report: .gstack/qa-reports/qa-report-localhost-3002-2026-09-05.md
test("sets the SSR status to 404 when a product does not exist", () => {
  const ssrContext: { statusCode?: number } = {};

  renderToString(
    <HelmetProvider>
      <Router ssrPath="/products/not-a-product" ssrContext={ssrContext}>
        <App />
      </Router>
    </HelmetProvider>
  );

  expect(ssrContext.statusCode).toBe(404);
});

test("leaves the SSR status successful for an existing product", () => {
  const ssrContext: { statusCode?: number } = {};

  renderToString(
    <HelmetProvider>
      <Router
        ssrPath="/products/hook-keyring-rvst"
        ssrContext={ssrContext}
      >
        <App />
      </Router>
    </HelmetProvider>
  );

  expect(ssrContext.statusCode).toBeUndefined();
});
