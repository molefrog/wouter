import React from "react";
import { render, cleanup, fireEvent } from "react-testing-library";

import { Link } from "../index.js";

afterEach(cleanup);

it("renders a link with proper attributes", () => {
  const { container } = render(
    <Link href="/about">
      <a className="link--active">Click Me</a>
    </Link>
  );

  const link = container.firstChild;

  expect(link.tagName).toBe("A");
  expect(link.className).toBe("link--active");
  expect(link.getAttribute("href")).toBe("/about");
  expect(link.textContent).toBe("Click Me");
});

it("wraps children in an <a /> if needed", () => {
  const { container } = render(<Link href="/about">Testing</Link>);
  const link = container.firstChild;

  expect(link.tagName).toBe("A");
  expect(link.textContent).toBe("Testing");
});

it("works for any other elements as well", () => {
  const { container } = render(
    <Link href="/about">
      <div className="link--wannabe">Click Me</div>
    </Link>
  );

  const link = container.firstChild;

  expect(link.tagName).toBe("DIV");
  expect(link.className).toBe("link--wannabe");
  expect(link.textContent).toBe("Click Me");
});

it("still creates a plain link when nothing is passed", () => {
  const { container } = render(<Link href="/about" />);
  const link = container.firstChild;

  expect(link.tagName).toBe("A");
  expect(link.getAttribute("href")).toBe("/about");
});

it("supports `to` prop as an alias to `href`", () => {
  const { container } = render(<Link to="/about">Hello</Link>);
  const link = container.firstChild;

  expect(link.getAttribute("href")).toBe("/about");
});

it("performs a navigation when the link is clicked", () => {
  const { container, getByTestId } = render(
    <Link href="/goo-baz">
      <a data-testid="link" />
    </Link>
  );
  fireEvent.click(getByTestId("link"));
  expect(location.pathname).toBe("/goo-baz");
});

it("accepts an `onClick` prop, fired after the navigation", () => {
  const clickHandler = jest.fn();

  const { container, getByTestId } = render(
    <Link href="/" onClick={clickHandler}>
      <a data-testid="link" />
    </Link>
  );

  fireEvent.click(getByTestId("link"));
  expect(clickHandler).toHaveBeenCalledTimes(1);
});
