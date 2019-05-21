/** @jsx h */
import { h, Fragment, options } from "preact";
import { act, teardown } from "preact/test-utils";
import { render, cleanup, fireEvent } from "preact-testing-library";

import { Router, Route, Link, Switch } from "../index.js";

// make the library use Preact exports
jest.mock("../react-deps.js", () => require("../preact/react-deps.js"));

describe("Preact support", () => {
  beforeEach(() => history.replaceState(0, 0, "/"));

  afterEach(cleanup);
  afterEach(teardown);

  it("renders properly and reacts on navigation", () => {
    const fn = jest.fn();
    let renderResult = null;

    act(() => {
      renderResult = render(
        <Fragment>
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
                {params => `Album ${params.name}`}
              </Route>
              <Route path="/:anything*">Nothing was found!</Route>
            </Switch>
          </main>
        </Fragment>
      );
    });

    const { container, getByTestId } = renderResult;

    const routesEl = getByTestId("routes");

    // default route should be rendered
    expect(routesEl.textContent).toBe("Nothing was found!");

    // link renders as A element
    const indexLink = getByTestId("index-link");
    expect(indexLink.tagName).toBe("A");

    act(() => fireEvent.click(indexLink));

    // performs a navigation when the link is clicked
    expect(location.pathname).toBe("/albums/all");

    // Link accepts an `onClick` prop, fired after the navigation
    expect(fn).toHaveBeenCalledTimes(1);

    // always renders no more than 1 matched children in Switch
    expect(routesEl.textContent).toBe("Rolling Stones Best 100 Albums");

    const featuredLink = getByTestId("featured-link");
    expect(featuredLink.getAttribute("href")).toBe("/albums/london-calling");

    act(() => fireEvent.click(featuredLink));

    expect(location.pathname).toBe("/albums/london-calling");
    expect(routesEl.textContent).toBe("Album london-calling");
  });
});
