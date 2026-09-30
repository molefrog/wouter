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
import { URLPattern } from "urlpattern-polyfill/urlpattern";
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
  "url-pattern.js",
];

const originalURLPattern = Object.getOwnPropertyDescriptor(
  globalThis,
  "URLPattern"
);

async function loadPreact(): Promise<typeof WouterPreact> {
  // Import from the copied files in src/ directory
  const module = (await import(
    join(import.meta.dir, "../src/index.js")
  )) as typeof WouterPreact;
  return module;
}

beforeAll(async () => {
  Object.defineProperty(globalThis, "URLPattern", {
    value: URLPattern,
    configurable: true,
    writable: true,
  });
  const wouterSrc = join(import.meta.dir, "../../wouter/src");
  const preactSrc = join(import.meta.dir, "../src");

  for (const file of filesToCopy) {
    await copyFile(join(wouterSrc, file), join(preactSrc, file));
  }
});

afterAll(async () => {
  if (originalURLPattern)
    Object.defineProperty(globalThis, "URLPattern", originalURLPattern);
  else Reflect.deleteProperty(globalThis, "URLPattern");
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

  test("asChild forwards props and preserves the child's ref (#536)", async () => {
    const { Link, Router } = await loadPreact();
    const container = document.body.appendChild(document.createElement("div"));
    const childRef = mock();
    try {
      act(() => {
        render(
          <Router base="/app">
            <Link
              href="/about"
              asChild
              className="parent"
              style={{ color: "red" }}
              aria-label="About us"
            >
              <a ref={childRef} className="child" title="Child title">
                About
              </a>
            </Link>
          </Router>,
          container
        );
      });
      const link = container.querySelector("a")!;
      expect(link.getAttribute("href")).toBe("/app/about");
      expect(link.className).toBe("parent");
      expect(link.style.color).toBe("red");
      expect(link.getAttribute("aria-label")).toBe("About us");
      expect(link.title).toBe("Child title");
      expect(childRef).toHaveBeenCalledWith(link);
    } finally {
      act(() => render(null, container));
      container.remove();
    }
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

    // render inside `act` so that effects run and routes subscribe to location updates
    act(() => render(<App />, container));

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

    // subscribed routes re-render with the new location
    expect(routesEl.textContent).toBe("Rolling Stones Best 100 Albums");

    act(() => render(null, container));
    container.remove();
  });

  test("URLPattern routes inherit nested params and react to navigation", async () => {
    const { Router, Route, Switch, useParams, useRouter } = await loadPreact();
    const { urlPatternParser } = await import("wouter-preact/url-pattern");
    const { memoryLocation } = await import("wouter-preact/memory-location");
    const { hook, navigate } = memoryLocation({
      path: "/app/users/42/posts/7",
    });
    const container = document.body.appendChild(document.createElement("div"));
    const Post = () => {
      const { id, post } = useParams<{ id: string; post: string }>();
      return <>{`${id}:${post}:${useRouter().base}`}</>;
    };
    try {
      act(() => {
        render(
          <Router parser={urlPatternParser} base="/app" hook={hook}>
            <Switch>
              <Route path={"/users/:id(\\d+)"} nest>
                <Route path="/posts/:post">
                  <Post />
                </Route>
              </Route>
              <Route>Fallback</Route>
            </Switch>
          </Router>,
          container
        );
      });
      expect(container.textContent).toBe("42:7:/app/users/42");
      act(() => navigate("/app/users/42/posts/8"));
      expect(container.textContent).toBe("42:8:/app/users/42");
      act(() => navigate("/app/users/alex/posts/8"));
      expect(container.textContent).toBe("Fallback");
    } finally {
      act(() => render(null, container));
      container.remove();
    }
  });
});

describe("useSyncExternalStore shim", () => {
  test("re-renders when the store mutates between render and layout effect", async () => {
    // the internal shim is untyped, it mirrors the React useSyncExternalStore signature
    const { useSyncExternalStore } = (await import(
      // @ts-expect-error
      "../src/react-deps.js"
    )) as {
      useSyncExternalStore: <T>(
        subscribe: (cb: () => void) => () => void,
        getSnapshot: () => T,
        getSSRSnapshot?: () => T
      ) => T;
    };
    const { useLayoutEffect } = await import("preact/hooks");

    let value = "initial";
    const listeners = new Set<() => void>();
    const subscribe = (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    };

    // child layout effects run before the parent's, so this mutation happens
    // after the parent has rendered but before its layout effect compares snapshots
    const Child = () => {
      useLayoutEffect(() => {
        value = "mutated";
      }, []);
      return null;
    };

    const Parent = () => {
      const snapshot = useSyncExternalStore(subscribe, () => value);
      return (
        <div data-testid="snapshot">
          {snapshot}
          <Child />
        </div>
      );
    };

    const container = document.body.appendChild(document.createElement("div"));
    act(() => {
      render(<Parent />, container);
    });

    expect(container.textContent).toBe("mutated");
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
