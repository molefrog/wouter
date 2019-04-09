import TestRenderer from "react-test-renderer";
import React from "react";

import { Router, useRouter } from "../index.js";

it("can be implicitly created", () => {
  const WithRouter = props => <div />;

  const App = () => {
    const router = useRouter();
    return <WithRouter router={router} />;
  };

  const instance = TestRenderer.create(<App />).root;
  const router = instance.findByType(WithRouter).props.router;

  expect(router).toBeInstanceOf(Object);
});

xit("can be customized via a top-level <Router /> component", () => {
  const WithRouter = props => <div />;

  const App = () => {
    const router = useRouter();
    return <WithRouter router={router} />;
  };

  const newHistory = { foo: "bar" };

  const instance = TestRenderer.create(
    <Router history={newHistory}>
      <App />
    </Router>
  ).root;
  const router = instance.findByType(WithRouter).props.router;

  expect(router).toBeInstanceOf(Object);
  expect(router.history).toBe(newHistory);
});
