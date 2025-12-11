import { test, expect, describe, mock, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Router, Link, useLocation, type AroundNavHandler } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";

afterEach(cleanup);

describe("view transitions", () => {
  test("Link with transition prop triggers aroundNav with transition in options", () => {
    // 1. Setup: create aroundNav callback that captures calls
    const aroundNav: AroundNavHandler = mock((navigate, to, options) => {
      navigate(to, options);
    });

    const { hook } = memoryLocation({ path: "/" });

    // 2. Render Link with transition prop
    const { getByTestId } = render(
      <Router hook={hook} aroundNav={aroundNav}>
        <Link href="/about" transition data-testid="link">
          About
        </Link>
      </Router>
    );

    // 3. Click the link
    fireEvent.click(getByTestId("link"));

    // 4. Verify aroundNav was called with transition: true in options
    expect(aroundNav).toHaveBeenCalledTimes(1);

    const [navigateFn, to, options] = (aroundNav as ReturnType<typeof mock>)
      .mock.calls[0];

    expect(typeof navigateFn).toBe("function");
    expect(to).toBe("/about");
    expect(options.transition).toBe(true);
  });

  test("useLocation navigate with transition option triggers aroundNav", () => {
    const aroundNav: AroundNavHandler = mock((navigate, to, options) => {
      navigate(to, options);
    });

    const { hook } = memoryLocation({ path: "/" });

    const NavigateButton = () => {
      const [, navigate] = useLocation();
      return (
        <button
          data-testid="btn"
          onClick={() => navigate("/about", { transition: true })}
        >
          Go
        </button>
      );
    };

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={aroundNav}>
        <NavigateButton />
      </Router>
    );

    fireEvent.click(getByTestId("btn"));

    expect(aroundNav).toHaveBeenCalledTimes(1);

    const [, to, options] = (aroundNav as ReturnType<typeof mock>).mock.calls[0];
    expect(to).toBe("/about");
    expect(options.transition).toBe(true);
  });

  test("navigation does not happen if aroundNav doesn't call navigate", () => {
    // aroundNav that does nothing
    const aroundNav: AroundNavHandler = mock(() => {});

    const { hook } = memoryLocation({ path: "/" });

    const LocationDisplay = () => {
      const [location] = useLocation();
      return <span data-testid="location">{location}</span>;
    };

    const { getByTestId } = render(
      <Router hook={hook} aroundNav={aroundNav}>
        <LocationDisplay />
        <Link href="/about" data-testid="link">
          About
        </Link>
      </Router>
    );

    // Verify initial location
    expect(getByTestId("location").textContent).toBe("/");

    // Click the link
    fireEvent.click(getByTestId("link"));

    // aroundNav was called but didn't call navigate
    expect(aroundNav).toHaveBeenCalledTimes(1);

    // Location should remain unchanged
    expect(getByTestId("location").textContent).toBe("/");
  });
});
