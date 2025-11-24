import { type MouseEventHandler } from "react";
import { test, expect, afterEach, mock, describe } from "bun:test";
import { render, cleanup, fireEvent, act } from "@testing-library/react";

import { Router, Link } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";

afterEach(cleanup);

describe("<Link />", () => {
  test("renders a link with proper attributes", () => {
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

  test("passes ref to <a />", () => {
    const refCallback = mock<(element: HTMLAnchorElement) => void>();
    const { getByText } = render(
      <Link href="/" ref={refCallback}>
        Testing
      </Link>
    );

    const element = getByText("Testing");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/");

    expect(refCallback).toHaveBeenCalledTimes(1);
    expect(refCallback).toHaveBeenCalledWith(element);
  });

  test("still creates a plain link when nothing is passed", () => {
    const { getByTestId } = render(<Link href="/about" data-testid="link" />);

    const element = getByTestId("link");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/about");
    expect(element).toBeEmptyDOMElement();
  });

  test("supports `to` prop as an alias to `href`", () => {
    const { getByText } = render(<Link to="/about">Hello</Link>);
    const element = getByText("Hello");

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("href", "/about");
  });

  test("performs a navigation when the link is clicked", () => {
    const { getByTestId } = render(
      <Link href="/goo-baz" data-testid="link">
        link
      </Link>
    );

    fireEvent.click(getByTestId("link"));

    expect(location.pathname).toBe("/goo-baz");
  });

  test("supports replace navigation", () => {
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

  test("ignores the navigation when clicked with modifiers", () => {
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

  test("ignores the navigation when event is cancelled", () => {
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

  test("accepts an `onClick` prop, fired before the navigation", () => {
    const clickHandler = mock();

    const { getByTestId } = render(
      <Link href="/" onClick={clickHandler} data-testid="link" />
    );

    fireEvent.click(getByTestId("link"));
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  test("renders `href` with basepath", () => {
    const { getByTestId } = render(
      <Router base="/app">
        <Link href="/dashboard" data-testid="link" />
      </Router>
    );

    const link = getByTestId("link");
    expect(link.getAttribute("href")).toBe("/app/dashboard");
  });

  test("renders `href` with absolute links", () => {
    const { getByTestId } = render(
      <Router base="/app">
        <Link href="~/home" data-testid="link" />
      </Router>
    );

    const element = getByTestId("link");
    expect(element).toHaveAttribute("href", "/home");
  });

  test("supports history state", () => {
    const testState = { hello: "world" };
    const { getByTestId } = render(
      <Link href="/goo-baz" state={testState} data-testid="link">
        link
      </Link>
    );

    fireEvent.click(getByTestId("link"));
    expect(location.pathname).toBe("/goo-baz");
    expect(history.state).toStrictEqual(testState);
  });

  test("can be configured to use custom href formatting", () => {
    const formatter = (href: string) => `#${href}`;

    const { getByTestId } = render(
      <>
        <Router hrefs={formatter}>
          <Link href="/" data-testid="root" />
          <Link href="/home" data-testid="home" />
        </Router>

        <Router base="/app" hrefs={formatter}>
          <Link href="~/home" data-testid="absolute" />
        </Router>
      </>
    );

    expect(getByTestId("root")).toHaveAttribute("href", "#/");
    expect(getByTestId("home")).toHaveAttribute("href", "#/home");
    expect(getByTestId("absolute")).toHaveAttribute("href", "#/home");
  });
});

describe("active links", () => {
  test("proxies `className` when it is a string", () => {
    const { getByText } = render(
      <Link href="/" className="link--active warning">
        Click Me
      </Link>
    );

    const element = getByText("Click Me");
    expect(element).toHaveAttribute("class", "link--active warning");
  });

  test("calls the `className` function with active link flag", () => {
    const { navigate, hook } = memoryLocation({ path: "/" });

    const { getByText } = render(
      <Router hook={hook}>
        <Link
          href="/"
          className={(isActive) => {
            return [isActive ? "active" : "", "link"].join(" ");
          }}
        >
          Click Me
        </Link>
      </Router>
    );

    const element = getByText("Click Me");
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("active");
    expect(element).toHaveClass("link");

    act(() => navigate("/about"));

    expect(element).not.toHaveClass("active");
    expect(element).toHaveClass("link");
  });

  test("correctly highlights active links when using custom href formatting", () => {
    const formatter = (href: string) => `#${href}`;
    const { navigate, hook } = memoryLocation({ path: "/" });

    const { getByText } = render(
      <Router hook={hook} hrefs={formatter}>
        <Link
          href="/"
          className={(isActive) => {
            return [isActive ? "active" : "", "link"].join(" ");
          }}
        >
          Click Me
        </Link>
      </Router>
    );

    const element = getByText("Click Me");
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("active");
    expect(element).toHaveClass("link");

    act(() => navigate("/about"));

    expect(element).not.toHaveClass("active");
    expect(element).toHaveClass("link");
  });
});

describe("<Link /> with `asChild` prop", () => {
  test("when `asChild` is not specified, wraps the children in an <a />", () => {
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

    expect(link.parentElement?.tagName).toBe("A");
    expect(link.parentElement).toHaveAttribute("href", "/about");
  });

  test("when invalid element is provided, wraps the children in an <a />", () => {
    const { getByText } = render(
      /* @ts-expect-error */
      <Link href="/about" asChild>
        Click Me
      </Link>
    );

    const link = getByText("Click Me");

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveTextContent("Click Me");
  });

  test("when more than one element is provided, wraps the children in an <a />", async () => {
    const { getByText } = render(
      /* @ts-expect-error */
      <Link href="/about" asChild>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </Link>
    );

    const span = getByText("1");

    expect(span.parentElement?.tagName).toBe("A");

    expect(span.parentElement).toHaveAttribute("href", "/about");
    expect(span.parentElement).toHaveTextContent("123");
  });

  test("injects href prop when rendered with `asChild`", () => {
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

  test("missing href or to won't crash", () => {
    const { getByText } = render(
      /* @ts-expect-error */
      <Link>Click Me</Link>
    );

    const link = getByText("Click Me");

    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", undefined);
    expect(link).toHaveTextContent("Click Me");
  });
});
