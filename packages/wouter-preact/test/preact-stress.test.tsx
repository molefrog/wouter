/** @jsx h */
/** @jsxFrag Fragment */
/** @jsxImportSource preact */

import { test, expect, describe, beforeAll, afterAll, mock } from "bun:test";
import { render } from "preact";
import { act, setupRerender, teardown } from "preact/test-utils";
import { copyFile, rm } from "fs/promises";
import { join } from "path";
import type * as WouterPreact from "../types/index.js";

// Files to copy from wouter/src to wouter-preact/src
const filesToCopy = [
  "memory-location.js",
  "paths.js",
  "use-browser-location.js",
  "use-hash-location.js",
  "use-sync-external-store.js",
  "use-sync-external-store.native.js",
  "index.js",
];

async function loadPreact(): Promise<typeof WouterPreact> {
  return (await import(
    join(import.meta.dir, "../src/index.js")
  )) as typeof WouterPreact;
}

beforeAll(async () => {
  const wouterSrc = join(import.meta.dir, "../../wouter/src");
  const preactSrc = join(import.meta.dir, "../src");
  for (const file of filesToCopy) {
    await copyFile(join(wouterSrc, file), join(preactSrc, file));
  }
});

afterAll(async () => {
  const preactSrc = join(import.meta.dir, "../src");
  for (const file of filesToCopy) {
    await rm(join(preactSrc, file), { force: true });
  }
});

describe("Preact stress", () => {
  test("Redirect inside Switch unmounts the tree synchronously", async () => {
    setupRerender();
    const { Route, Switch, Redirect } = await loadPreact();

    history.replaceState(null, "", "/start");
    const container = document.body.appendChild(document.createElement("div"));

    const App = () => (
      <div data-testid="routes">
        <Switch>
          <Route path="/start">
            <Redirect to="/target" />
            starting...
          </Route>
          <Route path="/target">arrived</Route>
          <Route path="*">not found</Route>
        </Switch>
      </div>
    );

    act(() => {
      render(<App />, container);
    });

    expect(location.pathname).toBe("/target");
    expect(container.textContent).toBe("arrived");

    render(null, container);
    container.remove();
    teardown();
  });

  test("navigation outside of act with multiple subscribers", async () => {
    setupRerender();
    const { Route, Switch, useLocation } = await loadPreact();

    history.replaceState(null, "", "/a");
    const container = document.body.appendChild(document.createElement("div"));

    let nav: (to: string) => void;
    const effectLog: string[] = [];

    const Nav = () => {
      const [, navigate] = useLocation();
      nav = navigate;
      return null;
    };

    const A = () => <>page a</>;
    const B = () => <>page b</>;

    const App = () => (
      <>
        <Nav />
        <div data-testid="routes">
          <Switch>
            <Route path="/a" component={A} />
            <Route path="/b" component={B} />
          </Switch>
        </div>
      </>
    );

    act(() => {
      render(<App />, container);
    });

    const routes = () =>
      container.querySelector('[data-testid="routes"]')!.textContent;

    expect(routes()).toBe("page a");

    // navigate outside of act — mimics a real app event
    act(() => nav!("/b"));
    expect(routes()).toBe("page b");

    // browser back
    act(() => {
      history.back();
      // happy-dom fires popstate synchronously or not at all; dispatch manually
      dispatchEvent(new PopStateEvent("popstate"));
    });

    render(null, container);
    container.remove();
    teardown();
    expect(effectLog).toEqual([]);
  });

  test("rapid re-navigation in effect (guarded routes)", async () => {
    setupRerender();
    const { Route, Switch, useLocation } = await loadPreact();
    const { useLayoutEffect } = await import("preact/hooks");

    history.replaceState(null, "", "/private");
    const container = document.body.appendChild(document.createElement("div"));

    const Guard = ({ children }: { children: any }) => {
      const [, navigate] = useLocation();
      useLayoutEffect(() => {
        navigate("/login", { replace: true });
      }, []);
      return children;
    };

    const App = () => (
      <div data-testid="routes">
        <Switch>
          <Route path="/private">
            <Guard>secret</Guard>
          </Route>
          <Route path="/login">login</Route>
        </Switch>
      </div>
    );

    act(() => {
      render(<App />, container);
    });

    expect(location.pathname).toBe("/login");
    expect(container.textContent).toBe("login");

    render(null, container);
    container.remove();
    teardown();
  });
});
