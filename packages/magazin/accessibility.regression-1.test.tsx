import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
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

// Regression: ISSUE-005 — icon-only links had empty or numeric-only names
// Found by /qa on 2026-09-05
// Report: .gstack/qa-reports/qa-report-localhost-3002-2026-09-05.md
test("names icon-only product navigation links", () => {
  const { getByRole } = renderAppAt("/products/silver-ok-ring");

  expect(
    getByRole("link", { name: "Shopping cart, 7 items" })
  ).toBeInTheDocument();
  expect(
    getByRole("link", { name: "Back to products" })
  ).toBeInTheDocument();
});

// Regression: ISSUE-007 — filters and sort omitted accessible state and purpose
// Found by /qa on 2026-09-05
// Report: .gstack/qa-reports/qa-report-localhost-3002-2026-09-05.md
test("exposes the selected category and sort control purpose", () => {
  const { getByRole } = renderAppAt(
    "/?category=accessories&sort=price-desc"
  );

  expect(getByRole("button", { name: "Accessories" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  expect(getByRole("button", { name: "All" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  expect(getByRole("combobox", { name: "Sort products" })).toHaveValue(
    "price-desc"
  );
});
