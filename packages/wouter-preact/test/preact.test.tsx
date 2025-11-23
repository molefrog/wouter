/** @jsx h */
/** @jsxFrag Fragment */
/** @jsxImportSource preact */

import {
  test,
  expect,
  describe,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  mock,
} from "bun:test";
import { render } from "preact";
import { act, setupRerender, teardown } from "preact/test-utils";
import renderToString from "preact-render-to-string";
import { copyFile, rm } from "fs/promises";
import { join } from "path";
import type * as WouterPreact from "../types/index.js";

const assertType = <T,>(_value: T): void => {};

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
  // Import from the copied files in src/ directory
  const module = (await import(
    join(import.meta.dir, "../src/index.js")
  )) as typeof WouterPreact;
  return module;
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

describe("Preact support", () => {
  beforeEach(() => {
    setupRerender();
  });

  afterEach(() => {
    teardown();
  });

  describe("useRoute", () => {
    test("should only accept strings", async () => {
      const { useRoute } = await loadPreact();

      const Component = () => {
        // @ts-expect-error
        assertType(useRoute(Symbol()));
        // @ts-expect-error
        assertType(useRoute());
        assertType(useRoute("/"));
        return <div>Hello</div>;
      };

      expect(typeof Component).toBe("function"); // dummy, we only care about the types
    });
  });

  test("renders properly and reacts on navigation", async () => {
    const { Route, Link, Switch } = await loadPreact();

    const container = document.body.appendChild(document.createElement("div"));
    const fn = mock();

    const App = () => {
      const handleAsChildClick = mock();

      return (
        <>
          <nav>
            <Link href="/albums/all" onClick={fn} data-testid="index-link">
              The Best Albums Ever
            </Link>

            <Link
              to="/albums/london-calling"
              asChild
              onClick={handleAsChildClick}
            >
              <a data-testid="featured-link">
                Featured Now: London Calling, Clash
              </a>
            </Link>
          </nav>

          <main data-testid="routes">
            <Switch>
              <>Welcome to the list of {100} greatest albums of all time!</>
              <Route path="/albums/all">Rolling Stones Best 100 Albums</Route>
              <Route path="/albums/:name">
                {(params) => `Album ${params.name}`}
              </Route>
              <Route path="*">Nothing was found!</Route>
            </Switch>
          </main>
        </>
      );
    };

    let node = render(<App />, container);

    const routesEl = container.querySelector('[data-testid="routes"]')!;
    const indexLinkEl = container.querySelector('[data-testid="index-link"]')!;
    const featLinkEl = container.querySelector(
      '[data-testid="featured-link"]'
    )!;

    // default route should be rendered
    expect(routesEl.textContent).toBe("Nothing was found!");
    expect(featLinkEl.getAttribute("href")).toBe("/albums/london-calling");

    // link renders as A element
    expect(indexLinkEl.tagName).toBe("A");

    act(() => {
      const evt = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      });

      indexLinkEl.dispatchEvent(evt);
    });

    // performs a navigation when the link is clicked
    expect(location.pathname).toBe("/albums/all");

    // Link accepts an `onClick` prop, fired after the navigation
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("Preact SSR", () => {
  test.skip("supports SSR (fix: useSyncExternalStore polyfill in Bun)", async () => {
    const { Router, useLocation } = await loadPreact();

    const LocationPrinter = () => {
      const [location] = useLocation();
      return <>location = {location}</>;
    };

    const rendered = renderToString(
      <Router ssrPath="/ssr/preact">
        <LocationPrinter />
      </Router>
    );

    expect(rendered).toContain("/ssr/preact");
  });
});
