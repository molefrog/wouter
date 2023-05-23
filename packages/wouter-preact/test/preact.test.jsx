import { render } from "preact";
import { it, expect, describe, beforeEach, afterEach, vi } from "vitest";
import { act, setupRerender, teardown } from "preact/test-utils";

import { Route, Link, Switch } from 'wouter-preact'

describe("Preact support", () => {
  beforeEach(() => {
    history.replaceState(null, "", "/");
    setupRerender();
  });

  afterEach(() => {
    teardown();
  });

  it("renders properly and reacts on navigation", () => {
    const container = document.body.appendChild(document.createElement("div"));
    const fn = vi.fn();

    const App = () => (
      <>
        <nav>
          <Link href="/albums/all" onClick={fn} data-testid="index-link">
            The Best Albums Ever
          </Link>
          <Link to="/albums/london-calling">
            <a data-testid="featured-link">
              Featured Now: London Calling, Clash
            </a>
          </Link>
        </nav>

        <main data-testid="routes">
          <Switch>
            Welcome to the list of {100} greatest albums of all time!
            <Route path="/albums/all">Rolling Stones Best 100 Albums</Route>
            <Route path="/albums/:name">
              {(params) => `Album ${params.name}`}
            </Route>
            <Route path="/:anything*">Nothing was found!</Route>
          </Switch>
        </main>
      </>
    );

    let node = render(<App />, container);

    const routesEl = container.querySelector('[data-testid="routes"]');
    const indexLinkEl = container.querySelector('[data-testid="index-link"]');
    const featLinkEl = container.querySelector('[data-testid="featured-link"]');

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
