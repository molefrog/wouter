import { expect, test } from "bun:test";
import { fireEvent, render } from "@testing-library/react";
import { HelmetProvider } from "@dr.pogodin/react-helmet";

import { App } from "./App";

function renderAppAt(path: string) {
  history.replaceState(null, "", path);
  return render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}

// Regression: ISSUE-002 — Add to Cart showed success without changing the cart
// Found by /qa on 2026-09-05
// Report: .gstack/qa-reports/qa-report-localhost-3002-2026-09-05.md
test("adds a new product and updates every cart summary", () => {
  const { getByRole, getByText } = renderAppAt(
    "/products/silver-ok-ring"
  );

  fireEvent.click(getByRole("link", { name: "Add to Cart" }));

  expect(location.pathname).toBe("/cart");
  expect(getByText("Silver OK Ring")).toBeInTheDocument();
  expect(getByText("1 × $99")).toBeInTheDocument();
  expect(
    getByRole("link", { name: "Shopping cart, 8 items" })
  ).toBeInTheDocument();
  expect(getByText("$1,174")).toBeInTheDocument();
  expect(getByText("Silver OK Ring added to cart")).toBeInTheDocument();
});

// Regression: ISSUE-003 — quantities were ignored by line and cart totals
// Found by /qa on 2026-09-05
// Report: .gstack/qa-reports/qa-report-localhost-3002-2026-09-05.md
test("increments an existing product and calculates quantity-aware totals", () => {
  const { getByRole, getByText } = renderAppAt(
    "/products/hook-keyring-rvst"
  );

  fireEvent.click(getByRole("link", { name: "Add to Cart" }));

  expect(getByText("3 × $65")).toBeInTheDocument();
  expect(getByText("$195")).toBeInTheDocument();
  expect(getByText("$1,140")).toBeInTheDocument();
  expect(
    getByRole("link", { name: "Shopping cart, 8 items" })
  ).toBeInTheDocument();
});
