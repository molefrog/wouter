import * as React from "react";
import { it, expect, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

import { Router, Link } from "wouter";

const LinkWithForwardedRef = (props) => {
  const ref = React.createRef();

  React.useEffect(() => {
    ref.current.innerHTML = "Tested";
  }, [ref]);

  return (
    <Link href="/about" ref={ref}>
      {props.children}
    </Link>
  );
};

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

it("passes ref to <a />", () => {
  const { container } = render(
    <LinkWithForwardedRef>Testing</LinkWithForwardedRef>
  );
  const link = container.firstChild;

  expect(link.tagName).toBe("A");
  expect(link.textContent).toBe("Tested");
});

it("passes ref to any other child element", () => {
  const { container } = render(
    <LinkWithForwardedRef>
      <div>Testing</div>
    </LinkWithForwardedRef>
  );
  const link = container.firstChild;

  expect(link.tagName).toBe("DIV");
  expect(link.textContent).toBe("Tested");
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
  const { getByTestId } = render(
    <Link href="/goo-baz">
      <a data-testid="link" />
    </Link>
  );
  fireEvent.click(getByTestId("link"));
  expect(location.pathname).toBe("/goo-baz");
});

it("supports replace navigation", () => {
  const { getByTestId } = render(
    <Link href="/goo-baz" replace>
      <a data-testid="link" />
    </Link>
  );

  const histBefore = history.length;

  fireEvent.click(getByTestId("link"));
  expect(location.pathname).toBe("/goo-baz");
  expect(history.length).toBe(histBefore);
});

it("ignores the navigation when clicked with modifiers", () => {
  const { getByTestId } = render(
    <Link href="/users" data-testid="link">
      click
    </Link>
  );
  fireEvent(
    getByTestId("link"),
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    })
  );
  expect(location.pathname).not.toBe("/users");
});

it("ignores the navigation when event is cancelled", () => {
  const clickHandler = (e) => {
    e.preventDefault();
  };

  const { getByTestId } = render(
    <Link href="/users" data-testid="link" onClick={clickHandler}>
      click
    </Link>
  );

  fireEvent.click(getByTestId("link"));
  expect(location.pathname).not.toBe("/users");
});

it("accepts an `onClick` prop, fired before the navigation", () => {
  const clickHandler = vi.fn();

  const { getByTestId } = render(
    <Link href="/" onClick={clickHandler}>
      <a data-testid="link" />
    </Link>
  );

  fireEvent.click(getByTestId("link"));
  expect(clickHandler).toHaveBeenCalledTimes(1);
});

it("renders `href` with basepath", () => {
  const { getByTestId } = render(
    <Router base="/app">
      <Link href="/dashboard" data-testid="link" />
    </Router>
  );

  const link = getByTestId("link");
  expect(link.getAttribute("href")).toBe("/app/dashboard");
});

it("renders `href` with absolute links", () => {
  const { getByTestId } = render(
    <Router base="/app">
      <Link href="~/home" data-testid="link" />
    </Router>
  );

  const link = getByTestId("link");
  expect(link.getAttribute("href")).toBe("/home");
});
