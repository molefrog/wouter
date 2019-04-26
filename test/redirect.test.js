import React from "react";
import TestRenderer from "react-test-renderer";

import { Redirect } from "../index.js";

it("renders nothing", () => {
  const rendered = TestRenderer.create(<Redirect to="/users" />).root;
  expect(rendered.children.length).toBe(0);
});
