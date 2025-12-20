import { test, expect, describe, mock, afterEach, beforeEach } from "bun:test";
import { render, cleanup, fireEvent, act, waitFor } from "@testing-library/react";
import { Router, Link, useLocation } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";
import {
  useScrollRestoration,
  createScrollRestoration,
  composeAroundNav,
} from "../src/use-scroll-restoration.js";

afterEach(cleanup);

// Helper to wait for requestAnimationFrame
const waitForRAF = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

describe("useScrollRestoration", () => {
  test("returns an aroundNav handler", () => {
    const TestComponent = () => {
      const scrollRestoration = useScrollRestoration();
      expect(typeof scrollRestoration).toBe("function");
      return null;
    };

    render(<TestComponent />);
  });

  test("navigates correctly through aroundNav", () => {
    const { hook } = memoryLocation({ path: "/" });

    const LocationDisplay = () => {
      const [location] = useLocation();
      return <span data-testid="location">{location}</span>;
    };

    const App = () => {
      const scrollRestoration = useScrollRestoration();

      return (
        <Router hook={hook} aroundNav={scrollRestoration}>
          <LocationDisplay />
          <Link href="/about" data-testid="link">
            About
          </Link>
        </Router>
      );
    };

    const { getByTestId } = render(<App />);

    expect(getByTestId("location").textContent).toBe("/");

    fireEvent.click(getByTestId("link"));

    expect(getByTestId("location").textContent).toBe("/about");
  });

  test("saves scroll position before navigation", () => {
    const { hook } = memoryLocation({ path: "/" });

    // Mock scrollY
    const originalScrollY = window.scrollY;
    Object.defineProperty(window, "scrollY", {
      value: 100,
      writable: true,
      configurable: true,
    });

    const App = () => {
      const scrollRestoration = useScrollRestoration();

      return (
        <Router hook={hook} aroundNav={scrollRestoration}>
          <Link href="/about" data-testid="link">
            About
          </Link>
        </Router>
      );
    };

    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId("link"));

    // Check that scroll position was saved for current path
    // The key is based on location.pathname, which may vary in test environment
    const currentPath = location.pathname;
    expect(sessionStorage.getItem(`wouter_scroll_${currentPath}`)).toBe("100");

    // Cleanup
    Object.defineProperty(window, "scrollY", {
      value: originalScrollY,
      writable: true,
      configurable: true,
    });
  });

  test("scrolls to top on new navigation when scrollToTop is true (default)", async () => {
    const { hook } = memoryLocation({ path: "/" });
    const scrollToMock = mock(() => {});
    window.scrollTo = scrollToMock;

    const App = () => {
      const scrollRestoration = useScrollRestoration();

      return (
        <Router hook={hook} aroundNav={scrollRestoration}>
          <Link href="/about" data-testid="link">
            About
          </Link>
        </Router>
      );
    };

    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId("link"));

    // Wait for requestAnimationFrame
    await waitForRAF();

    // Should scroll to top (0, 0)
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });

  test("does not scroll to top when scrollToTop is false", async () => {
    const { hook } = memoryLocation({ path: "/" });
    const scrollToMock = mock(() => {});
    window.scrollTo = scrollToMock;

    const App = () => {
      const scrollRestoration = useScrollRestoration({ scrollToTop: false });

      return (
        <Router hook={hook} aroundNav={scrollRestoration}>
          <Link href="/about" data-testid="link">
            About
          </Link>
        </Router>
      );
    };

    const { getByTestId } = render(<App />);

    fireEvent.click(getByTestId("link"));

    // Wait for requestAnimationFrame
    await waitForRAF();

    // Should not scroll to top
    expect(scrollToMock).not.toHaveBeenCalled();
  });
});

describe("createScrollRestoration", () => {
  test("returns an aroundNav handler", () => {
    const scrollRestoration = createScrollRestoration();
    expect(typeof scrollRestoration).toBe("function");
  });

  test("can be used with Router", () => {
    const { hook } = memoryLocation({ path: "/" });
    const scrollRestoration = createScrollRestoration();

    const LocationDisplay = () => {
      const [location] = useLocation();
      return <span data-testid="location">{location}</span>;
    };

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={scrollRestoration}>
        <LocationDisplay />
        <Link href="/about" data-testid="link">
          About
        </Link>
      </Router>
    );

    expect(getByTestId("location").textContent).toBe("/");

    fireEvent.click(getByTestId("link"));

    expect(getByTestId("location").textContent).toBe("/about");
  });

  test("scrolls to top on new navigation", async () => {
    const { hook } = memoryLocation({ path: "/" });
    const scrollToMock = mock(() => {});
    window.scrollTo = scrollToMock;
    const scrollRestoration = createScrollRestoration();

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={scrollRestoration}>
        <Link href="/about" data-testid="link">
          About
        </Link>
      </Router>
    );

    fireEvent.click(getByTestId("link"));

    // Wait for requestAnimationFrame
    await waitForRAF();

    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });
});

describe("composeAroundNav", () => {
  test("composes multiple handlers in order", () => {
    const { hook } = memoryLocation({ path: "/" });
    const callOrder: string[] = [];

    const handler1 = mock((navigate: any, to: string, options: any) => {
      callOrder.push("handler1-before");
      navigate(to, options);
      callOrder.push("handler1-after");
    });

    const handler2 = mock((navigate: any, to: string, options: any) => {
      callOrder.push("handler2-before");
      navigate(to, options);
      callOrder.push("handler2-after");
    });

    const composed = composeAroundNav(handler1, handler2);

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={composed}>
        <Link href="/about" data-testid="link">
          About
        </Link>
      </Router>
    );

    fireEvent.click(getByTestId("link"));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);

    // Handler1 wraps Handler2, so:
    // handler1-before -> handler2-before -> navigate -> handler2-after -> handler1-after
    expect(callOrder).toEqual([
      "handler1-before",
      "handler2-before",
      "handler2-after",
      "handler1-after",
    ]);
  });

  test("handles empty handlers array", () => {
    const { hook } = memoryLocation({ path: "/" });
    const composed = composeAroundNav();

    const LocationDisplay = () => {
      const [location] = useLocation();
      return <span data-testid="location">{location}</span>;
    };

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={composed}>
        <LocationDisplay />
        <Link href="/about" data-testid="link">
          About
        </Link>
      </Router>
    );

    fireEvent.click(getByTestId("link"));

    expect(getByTestId("location").textContent).toBe("/about");
  });

  test("can compose scroll restoration with view transitions handler", async () => {
    const { hook } = memoryLocation({ path: "/" });
    const transitionCalled = mock(() => {});
    const scrollToMock = mock(() => {});
    window.scrollTo = scrollToMock;

    const scrollRestoration = createScrollRestoration();

    const viewTransitions = (
      navigate: any,
      to: string,
      options: { transition?: boolean }
    ) => {
      if (options?.transition) {
        transitionCalled();
      }
      navigate(to, options);
    };

    const composed = composeAroundNav(scrollRestoration, viewTransitions);

    const LocationDisplay = () => {
      const [location] = useLocation();
      return <span data-testid="location">{location}</span>;
    };

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={composed}>
        <LocationDisplay />
        <Link href="/about" transition data-testid="link">
          About
        </Link>
      </Router>
    );

    fireEvent.click(getByTestId("link"));

    // Wait for requestAnimationFrame
    await waitForRAF();

    expect(getByTestId("location").textContent).toBe("/about");
    expect(transitionCalled).toHaveBeenCalledTimes(1);
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });
});
