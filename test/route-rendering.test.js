import React from "react";
import TestRenderer from "react-test-renderer";

import { Router, Route } from "../index.js";
import { memoryLocation } from "./test-utils.js";

const testRouteRender = (initialPath, jsx) => {
  const instance = TestRenderer.create(
    <Router hook={memoryLocation(initialPath)}>{jsx}</Router>
  ).root;

  return instance;
};

it("accepts plain children", () => {
  const result = testRouteRender(
    "/foo",
    <Route path="/foo">
      <h1>Hello!</h1>
    </Route>
  );

  expect(result.findByType("h1").props.children).toBe("Hello!");
});

it("works with render props", () => {
  const result = testRouteRender(
    "/foo",
    <Route path="/foo">{() => <h1>Hello!</h1>}</Route>
  );

  expect(result.findByType("h1").props.children).toBe("Hello!");
});

it("passes a match param object to the render function", () => {
  const result = testRouteRender(
    "/users/alex",
    <Route path="/users/:name">{params => <h1>{params.name}</h1>}</Route>
  );

  expect(result.findByType("h1").props.children).toBe("alex");
});

it("renders nothing when there is not match", () => {
  const result = testRouteRender(
    "/bar",
    <Route path="/foo">
      <div>Hi!</div>
    </Route>
  );

  expect(() => result.findByType("div")).toThrow();
});

it("supports `component` prop similar to React-Router", () => {
  const Users = () => <h2>All users</h2>;

  const result = testRouteRender(
    "/foo",
    <Route path="/foo" component={Users} />
  );

  expect(result.findByType("h2").props.children).toBe("All users");
});
