import React from "react";
import { render } from "react-testing-library";

import Redirect from "../redirect.js";

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
