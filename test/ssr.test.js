/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Route, Router, useRoute } from "../index";
import staticHistory from "../extra/static-history";

describe("server-side rendering", () => {
  it("works via staticHistory", () => {
    const App = () => (
      <Router history={staticHistory("/users/baz")}>
        <Route path="/users/baz">foo</Route>
        <Route path="/users/:any*">bar</Route>
        <Route path="/users/:id">{params => params.id}</Route>
        <Route path="/about">baaaz</Route>
      </Router>
    );

    const rendered = renderToStaticMarkup(<App />);
    expect(rendered).toBe("foobarbaz");
  });

  it("supports hook-based routes", () => {
    const HookRoute = () => {
      const [match, params] = useRoute("/pages/:name");
      return match ? `Welcome to ${params.name}!` : "Not Found!";
    };

    const App = () => (
      <Router history={staticHistory("/pages/intro")}>
        <HookRoute />
      </Router>
    );

    const rendered = renderToStaticMarkup(<App />);
    expect(rendered).toBe("Welcome to intro!");
  });
});
