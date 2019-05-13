/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Route, Router, useRoute, Link } from "../index";
import staticLocationHook from "../static-location.js";

describe("server-side rendering", () => {
  it("works via staticHistory", () => {
    const App = () => (
      <Router hook={staticLocationHook("/users/baz")}>
        <Route path="/users/baz">foo</Route>
        <Route path="/users/:any*">bar</Route>
        <Route path="/users/:id">{params => params.id}</Route>
        <Route path="/about">should not be rendered</Route>
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
      <Router hook={staticLocationHook("/pages/intro")}>
        <HookRoute />
      </Router>
    );

    const rendered = renderToStaticMarkup(<App />);
    expect(rendered).toBe("Welcome to intro!");
  });

  it("renders valid and accessible link elements", () => {
    const App = () => (
      <Router hook={staticLocationHook("/")}>
        <Link href="/users/1" title="Profile">
          Mark
        </Link>
      </Router>
    );

    const rendered = renderToStaticMarkup(<App />);
    expect(rendered).toBe(`<a href="/users/1" title="Profile">Mark</a>`);
  });
});
