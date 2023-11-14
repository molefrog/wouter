import { type MouseEventHandler } from "react";
import { it, expect, afterEach, vi, describe } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

import { Router, Link } from "wouter";

afterEach(cleanup);

describe("<Link />", () => {
  it("renders a link with proper attributes", () => {
    const { getByText } = render(
      <Link href="/about" className="link--active">
        Click Me
      </Link>
    );

    const element = getByText("Click Me");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/about");
    expect(element).toHaveClass("link--active");
  });

  it("passes ref to <a />", () => {
    const refCallback = vi.fn<[HTMLAnchorElement], void>();
    const { getByText } = render(
      <Link href="/" ref={refCallback}>
        Testing
      </Link>
    );

    const element = getByText("Testing");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/");

    expect(refCallback).toBeCalledTimes(1);
    expect(refCallback).toBeCalledWith(element);
  });

  it("still creates a plain link when nothing is passed", () => {
    const { getByTestId } = render(<Link href="/about" data-testid="link" />);

    const element = getByTestId("link");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/about");
    expect(element).toBeEmptyDOMElement();
  });

  it("supports `to` prop as an alias to `href`", () => {
    const { getByText } = render(<Link to="/about">Hello</Link>);
    const element = getByText("Hello");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/about");
  });

  it("performs a navigation when the link is clicked", () => {
    const { getByTestId } = render(
      <Link href="/goo-baz" data-testid="link">
        link
      </Link>
    );

    fireEvent.click(getByTestId("link"));

    expect(location.pathname).toBe("/goo-baz");
  });

  it("supports replace navigation", () => {
    const { getByTestId } = render(
      <Link href="/goo-baz" replace data-testid="link">
        link
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
    const clickEvt = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    });

    // js-dom doesn't implement browser navigation (e.g. changing location
    // when a link is clicked) so we need just ingore it to avoid warnings
    clickEvt.preventDefault();

    fireEvent(getByTestId("link"), clickEvt);
    expect(location.pathname).not.toBe("/users");
  });

  it("ignores the navigation when event is cancelled", () => {
    const clickHandler: MouseEventHandler = (e) => {
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
      <Link href="/" onClick={clickHandler} data-testid="link" />
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

    const element = getByTestId("link");
    expect(element).toHaveAttribute("href", "/home");
  });

  it("supports history state", () => {
    const testState = { hello: "world" };
    const { getByTestId } = render(
      <Link href="/goo-baz" state={testState} data-testid="link">
        link
      </Link>
    );

    fireEvent.click(getByTestId("link"));
    expect(location.pathname).toBe("/goo-baz");
    expect(history.state).toBe(testState);
  });
});

describe("<Link /> with `asChild` prop", () => {
  it("works for any other elements as well", () => {
    const { getByText } = render(
      <Link href="/about">
        <div className="link--wannabe">Click Me</div>
      </Link>
    );

    const link = getByText("Click Me");

    expect(link.tagName).toBe("DIV");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveClass("link--wannabe");
    expect(link).toHaveTextContent("Click Me");
  });

  it("throws error when invalid element is provided", () => {
    expect(() =>
      render(
        <Link href="/about" asChild>
          Click Me
        </Link>
      )
    ).throw();
  });

  it("throws error when more than one element is provided", () => {
    expect(() =>
      render(
        <Link href="/about" asChild>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </Link>
      )
    ).throw();
  });

  it("injects href prop when rendered with `asChild`", () => {
    const { getByText } = render(
      <Link href="/about" asChild>
        <div className="link--wannabe">Click Me</div>
      </Link>
    );

    const link = getByText("Click Me");

    expect(link.tagName).toBe("DIV");
    expect(link).toHaveClass("link--wannabe");
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveTextContent("Click Me");
  });
});
