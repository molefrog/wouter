import React from "react";
import TestRenderer from "react-test-renderer";

import { Router, Route, Switch } from "../index.js";
import { memoryLocation } from "./test-utils.js";

const testRouteRender = (initialPath, jsx) => {
  const instance = TestRenderer.create(
    <Router hook={memoryLocation(initialPath)}>{jsx}</Router>
  ).root;

  return instance;
};

it("works well when nothing is provided", () => {
  const result = testRouteRender("/users/12", <Switch />);
  expect(result.children[0].children.length).toBe(0);
});

it("always renders no more than 1 matched children", () => {
  const result = testRouteRender(
    "/users/12",
    <Switch>
      <Route path="/users/home">
        <h1 />
      </Route>
      <Route path="/users/:id">
        <h2 />
      </Route>
      <Route path="/users/:rest*">
        <h3 />
      </Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(result.findByType("h2")).toBeTruthy();
});

it("ignores mixed children", () => {
  const result = testRouteRender(
    "/users",
    <Switch>
      Here is a<Route path="/users">route</Route>
      route
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(rendered[0].type).toBe(Route);
});

it("ignores other elements", () => {
  const Dummy = props => props.children;

  const result = testRouteRender(
    "/",
    <Switch>
      <b>Bold</b>
      <Dummy>Component</Dummy>
      <Route path="/">route</Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(rendered[0].type).toBe(Route);
});

it("allows to specify which routes to render via `location` prop", () => {
  const result = testRouteRender(
    "/something-different",
    <Switch location="/users">
      <Route path="/users">route</Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(rendered[0].type).toBe(Route);
});
