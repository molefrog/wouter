import React from "react";
import TestRenderer from "react-test-renderer";

import { Router, Route, Switch } from "../index.js";
import { memoryLocation } from "./test-utils.js";

import { render, act } from "@testing-library/react";

const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));

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

it("ignores falsy children", () => {
  const result = testRouteRender(
    "/users",
    <Switch>
      {""}
      {false}
      {null}
      {undefined}
      <Route path="/users">route</Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(rendered[0].type).toBe(Route);
});

it("matches regular components as well", () => {
  const Dummy = (props) => props.children;

  const result = testRouteRender(
    "/",
    <Switch>
      <Dummy path="/">Component</Dummy>
      <b>Bold</b>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(rendered[0].type).toBe(Dummy);
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

it("always ensures the consistency of inner routes rendering", async () => {
  history.replaceState(null, "", "/foo/bar");

  const { unmount } = render(
    <Switch>
      <Route path="/foo/:id">
        {(params) => {
          if (!params)
            throw new Error("Render prop is called with falsy params!");
          return null;
        }}
      </Route>
    </Switch>
  );

  await act(async () => {
    await raf();
    history.pushState(null, "", "/");
  });

  unmount();
});

it("supports catch-all routes with wildcard segments", async () => {
  const result = testRouteRender(
    "/something-different",
    <Switch>
      <Route path="/users">
        <h1 />
      </Route>
      <Route path="/:anything*">
        <h2 />
      </Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(result.findByType("h2")).toBeTruthy();
});

it("uses a route without a path prop as a fallback", async () => {
  const result = testRouteRender(
    "/something-different",
    <Switch>
      <Route path="/users">
        <h1 />
      </Route>
      <Route>
        <h2 />
      </Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(result.findByType("h2")).toBeTruthy();
});

it("correctly handles arrays as children", async () => {
  const result = testRouteRender(
    "/in-array-3",
    <Switch>
      {[1, 2, 3].map((i) => {
        const H = "h" + i;
        return (
          <Route key={i} path={"/in-array-" + i}>
            <H />
          </Route>
        );
      })}
      <Route>
        <h4 />
      </Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(result.findByType("h3")).toBeTruthy();
});

it("correctly handles fragments as children", async () => {
  const result = testRouteRender(
    "/in-fragment-2",
    <Switch>
      <>
        {[1, 2, 3].map((i) => {
          const H = "h" + i;
          return (
            <Route key={i} path={"/in-fragment-" + i}>
              <H />
            </Route>
          );
        })}
      </>
      <Route>
        <h4 />
      </Route>
    </Switch>
  );

  const rendered = result.children[0].children;

  expect(rendered.length).toBe(1);
  expect(result.findByType("h2")).toBeTruthy();
});
