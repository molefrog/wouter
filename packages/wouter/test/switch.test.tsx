import { it, expect } from "bun:test";

import { Router, Route, Switch } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";

import { render, act } from "@testing-library/react";
import { PropsWithChildren, ReactElement, JSX, useEffect } from "react";

const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));

const testRouteRender = (initialPath: string, jsx: ReactElement) => {
  return render(
    <Router hook={memoryLocation({ path: initialPath }).hook}>{jsx}</Router>
  );
};

it("works well when nothing is provided", () => {
  const { container } = testRouteRender("/users/12", <Switch>{null}</Switch>);
  // When Switch has no matching children, it renders null, so container should be empty
  expect(container).toBeEmptyDOMElement();
});

it("always renders no more than 1 matched children", () => {
  const { container } = testRouteRender(
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

  // Should only render the h2 that matches /users/:id
  expect(container.querySelectorAll("h1, h2, h3")).toHaveLength(1);
  expect(container.querySelector("h2")).toBeInTheDocument();
  expect(container.querySelector("h1")).not.toBeInTheDocument();
  expect(container.querySelector("h3")).not.toBeInTheDocument();
});

it("ignores mixed children", () => {
  const { container } = testRouteRender(
    "/users",
    <Switch>
      Here is a<Route path="/users">route</Route>
      route
    </Switch>
  );

  // Should only render the route content, ignoring text nodes
  expect(container).toHaveTextContent("route");
  // The text "Here is a" and "route" outside the Route should be ignored
  expect(container.textContent).toBe("route");
});

it("ignores falsy children", () => {
  const { container } = testRouteRender(
    "/users",
    <Switch>
      {""}
      {false}
      {null}
      {undefined}
      <Route path="/users">route</Route>
    </Switch>
  );

  // Should only render the route content
  expect(container).toHaveTextContent("route");
  expect(container.textContent).toBe("route");
});

it("matches regular components as well", () => {
  const Dummy = (props: PropsWithChildren<{ path: string }>) => (
    <>{props.children}</>
  );

  const { container } = testRouteRender(
    "/",
    <Switch>
      <Dummy path="/">Component</Dummy>
      <b>Bold</b>
    </Switch>
  );

  // Should render the Dummy component content
  expect(container).toHaveTextContent("Component");
  expect(container.querySelector("b")).not.toBeInTheDocument();
});

it("allows to specify which routes to render via `location` prop", () => {
  const { container } = testRouteRender(
    "/something-different",
    <Switch location="/users">
      <Route path="/users">route</Route>
    </Switch>
  );

  // Should render based on the location prop, not the actual path
  expect(container).toHaveTextContent("route");
});

it("always ensures the consistency of inner routes rendering", async () => {
  history.replaceState(null, "", "/foo/bar");

  render(
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
});

it("ignores a stale `match` prop when the location has changed (#556, #464)", () => {
  // when the location store updates, subscriptions fire bottom-up: a route
  // can re-render with a `match` prop computed by its Switch for the previous
  // location. this simulates that intermediate render: the `match`/`matchLoc`
  // props say "/2" while the actual location is already "/1"
  const { hook } = memoryLocation({ path: "/1" });

  const staleProps = { match: [true, {}], matchLoc: "/2" } as object;

  const { container } = render(
    <Router hook={hook}>
      <Route path="/2" {...staleProps}>
        <h2>stale</h2>
      </Route>
    </Router>
  );

  // the stale match must be ignored and re-computed against "/1" → no match
  expect(container).toBeEmptyDOMElement();
});

it("re-computes stale `match` params against the fresh location", () => {
  const { hook } = memoryLocation({ path: "/users/5" });

  const staleProps = {
    match: [true, { id: "1" }],
    matchLoc: "/users/1",
  } as object;

  const { container } = render(
    <Router hook={hook}>
      <Route path="/users/:id" {...staleProps}>
        {(params) => <h2>{params.id}</h2>}
      </Route>
    </Router>
  );

  // the same route still matches, but params must come from the fresh location
  expect(container.querySelector("h2")).toHaveTextContent("5");
});

it("trusts the `match` prop when `matchLoc` is absent (location override)", () => {
  const { hook } = memoryLocation({ path: "/somewhere-else" });

  const props = { match: [true, { id: "42" }] } as object;

  const { container } = render(
    <Router hook={hook}>
      <Route path="/users/:id" {...props}>
        {(params) => <h2>{params.id}</h2>}
      </Route>
    </Router>
  );

  // without `matchLoc` the match is unconditional, e.g. <Switch location="...">
  expect(container.querySelector("h2")).toHaveTextContent("42");
});

it("keeps rendering `location`-prop overridden routes after navigation", () => {
  const { hook, navigate } = memoryLocation({ path: "/a" });

  const { container } = render(
    <Router hook={hook}>
      <Switch location="/users">
        <Route path="/users">route</Route>
      </Switch>
    </Router>
  );

  expect(container).toHaveTextContent("route");

  // navigating must not invalidate matches pinned via the `location` prop
  act(() => navigate("/b"));
  expect(container).toHaveTextContent("route");
});

it("does not re-run effects of the previous route on back navigation", async () => {
  history.replaceState(null, "", "/effects-1");

  const effectLog: string[] = [];

  const Comp = ({ id }: { id: string }) => {
    // note: no dependency array, the effect runs on every render (see #556)
    useEffect(() => {
      effectLog.push(id);
    });
    return <>page {id}</>;
  };

  render(
    <Switch>
      <Route path="/effects-1">
        <Comp id="1" />
      </Route>
      <Route path="/effects-2">
        <Comp id="2" />
      </Route>
    </Switch>
  );

  await act(async () => {
    await raf();
    history.pushState(null, "", "/effects-2");
  });

  expect(effectLog).toEqual(["1", "2"]);

  // going back must not re-render (and re-run effects of) the route
  // that no longer matches
  await act(async () => {
    history.back();
    // happy-dom doesn't always fire popstate on history.back()
    history.replaceState(null, "", "/effects-1");
  });

  expect(effectLog).toEqual(["1", "2", "1"]);
});

it("supports catch-all routes with wildcard segments", async () => {
  const { container } = testRouteRender(
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

  // Should match the catch-all route
  expect(container.querySelectorAll("h1, h2")).toHaveLength(1);
  expect(container.querySelector("h2")).toBeInTheDocument();
  expect(container.querySelector("h1")).not.toBeInTheDocument();
});

it("uses a route without a path prop as a fallback", async () => {
  const { container } = testRouteRender(
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

  // Should match the fallback route (no path)
  expect(container.querySelectorAll("h1, h2")).toHaveLength(1);
  expect(container.querySelector("h2")).toBeInTheDocument();
  expect(container.querySelector("h1")).not.toBeInTheDocument();
});

it("correctly handles arrays as children", async () => {
  const { container } = testRouteRender(
    "/in-array-3",
    <Switch>
      {[1, 2, 3].map((i) => {
        const H = `h${i}` as keyof JSX.IntrinsicElements;
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

  // Should match the third route (/in-array-3)
  expect(container.querySelectorAll("h1, h2, h3, h4")).toHaveLength(1);
  expect(container.querySelector("h3")).toBeInTheDocument();
  expect(container.querySelector("h1")).not.toBeInTheDocument();
  expect(container.querySelector("h2")).not.toBeInTheDocument();
  expect(container.querySelector("h4")).not.toBeInTheDocument();
});

it("correctly handles fragments as children", async () => {
  const { container } = testRouteRender(
    "/in-fragment-2",
    <Switch>
      <>
        {[1, 2, 3].map((i) => {
          const H = `h${i}` as keyof JSX.IntrinsicElements;
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

  // Should match the second route (/in-fragment-2)
  expect(container.querySelectorAll("h1, h2, h3, h4")).toHaveLength(1);
  expect(container.querySelector("h2")).toBeInTheDocument();
  expect(container.querySelector("h1")).not.toBeInTheDocument();
  expect(container.querySelector("h3")).not.toBeInTheDocument();
  expect(container.querySelector("h4")).not.toBeInTheDocument();
});
