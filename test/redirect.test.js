import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { Link, Redirect } from "../index.js";

it("renders nothing", () => {
  const { container, unmount } = render(<Redirect to="/users" />);
  expect(container.childNodes.length).toBe(0);
  unmount();
});

it("results in change of current location", () => {
  const prevHistoryLength = history.length;
  const { unmount } = render(<Redirect to="/users" />);

  expect(location.pathname).toBe("/users");
  expect(history.length).toBe(prevHistoryLength + 1);
  unmount();
});

it("accepts a `replace` prop to replace last history entry instead of add a new one after redirection", () => {
  const { getByTestId } = render(
    <Link href="/admin">
      <a data-testid="link" />
    </Link>
  );

  fireEvent.click(getByTestId("link"));
  expect(location.pathname).toBe("/admin");
  const prevHistoryLength = history.length;
  const { unmount } = render(<Redirect replace to="/users" />);
  expect(history.length).toEqual(prevHistoryLength);
  unmount();
});

it("accepts a `state` prop to pass some state along with redirection", () => {
  const state = { from: "/admin" };
  const { getByTestId } = render(
    <Link href="/admin">
      <a data-testid="link" />
    </Link>
  );

  fireEvent.click(getByTestId("link"));
  expect(location.pathname).toBe("/admin");
  expect(history.state).toBe(0);
  const { unmount } = render(<Redirect state={state} to="/users" />);
  expect(history.state).toMatchObject(state);
  unmount();
});
