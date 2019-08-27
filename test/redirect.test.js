import React from "react";
import { render } from "@testing-library/react";

import { Redirect, Router } from "../index.js";

it("renders nothing", () => {
  const { container, unmount } = render(<Redirect to="/users" />);
  expect(container.childNodes.length).toBe(0);
  unmount();
});

it("results in change of current location", () => {
  const { unmount } = render(<Redirect to="/users" />);

  expect(location.pathname).toBe("/users");
  unmount();
});

it("redirect with a basepath router", () => {
  render(
    <Router basepath="/app">
      <Redirect to='/users'/>
    </Router>
  );

  expect(location.pathname).toBe("/app/users");
});
