/** @jsx h */
import { h } from "preact";
import { render, cleanup, fireEvent } from "preact-testing-library";
import { Router, Route, Link, Switch } from "../index.js";
import memoryHistory from "../extra/memory-history";

const testRouteRender = (initialPath, node) => {
  const history = memoryHistory(initialPath);
  const result = render(<Router history={history}>{node}</Router>);

  return result;
};

jest.mock("../react-deps.js", () => {
  const preactDeps = require("../preact/react-deps.js");

  return preactDeps;
});

afterEach(cleanup);

describe("Preact", () => {
  describe("Route", () => {
    it("renders correctly", () => {
      const { container } = testRouteRender(
        "/foo",
        <Route path="/foo">
          <h1>Hello!</h1>
        </Route>
      );

      const route = container.firstChild;

      expect(route.textContent).toBe("Hello!");
    });

    it("passes a match params object to the render function", () => {
      const { container } = testRouteRender(
        "/users/alex",
        <Route path="/users/:name">{params => <h1>{params.name}</h1>}</Route>
      );

      const route = container.firstChild;

      expect(route.textContent).toBe("alex");
    });

    it("renders nothing when there is not match", () => {
      const { container } = testRouteRender(
        "/bar",
        <Route path="/foo">
          <div>Hi!</div>
        </Route>
      );

      const route = container.firstChild;

      expect(route).toBeNull();
    });
  });

  describe("Switch", () => {
    it("works well when nothing is provided", () => {
      const { container } = testRouteRender("/users/12", <Switch />);

      expect(container.firstChild).toBeNull();
    });

    it("always renders no more than 1 matched children", () => {
      const { container } = testRouteRender(
        "/users/alex",
        <Switch>
          <Route path="/users/home">
            <h1 />
          </Route>
          <Route path="/users/:name">
            <h2>Hello, Alex!</h2>
          </Route>
          <Route path="/users/:rest*">
            <h3 />
          </Route>
        </Switch>
      );

      const route = container.firstChild;

      expect(route.tagName).toBe("H2");
      expect(route.textContent).toBe("Hello, Alex!");
    });
  });

  describe("Link", () => {
    it("renders a link with proper attributes", () => {
      const { container } = render(
        <Link href="/preact">
          <a className="link">Click Me</a>
        </Link>
      );

      const link = container.firstChild;

      expect(link.tagName).toBe("A");
      expect(link.className).toBe("link");
      expect(link.getAttribute("href")).toBe("/preact");
      expect(link.textContent).toBe("Click Me");
    });

    it("accepts an `onClick` prop, fired after the navigation", () => {
      const clickHandler = jest.fn();

      const { getByTestId } = render(
        <Link href="/" onClick={clickHandler}>
          <a data-testid="link" />
        </Link>
      );

      fireEvent.click(getByTestId("link"));
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it("performs a navigation when the link is clicked", () => {
      const { getByTestId } = render(
        <Link href="/goo-baz">
          <a data-testid="link" />
        </Link>
      );

      fireEvent.click(getByTestId("link"));
      expect(location.pathname).toBe("/goo-baz");
    });
  });
});
