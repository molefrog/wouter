import React from "react";
import { render, act } from "@testing-library/react";

import { useParams, Route } from "../index.js";

const Orders = () => {
  const params = useParams();
  return <>{JSON.stringify(params)}</>;
};

it("returns the correct params when used with component", () => {
  act(() => history.pushState(null, "", "/orders/20/items/carrot"));

  const { unmount, container } = render(
    <Route path="/orders/:id/items/:name" component={Orders} />
  );

  expect(JSON.parse(container.textContent)).toMatchObject({
    id: "20",
    name: "carrot",
  });
  unmount();
});

it("returns the correct params when used with render props", () => {
  act(() => history.pushState(null, "", "/orders/20/items/carrot"));

  const { unmount, container } = render(
    <Route path="/orders/:id/items/:name">{(_) => <Orders />}</Route>
  );

  expect(JSON.parse(container.textContent)).toMatchObject({
    id: "20",
    name: "carrot",
  });
  unmount();
});

it("returns the correct params when used with plain children", () => {
  act(() => history.pushState(null, "", "/orders/20/items/carrot"));

  const { unmount, container } = render(
    <Route path="/orders/:id/items/:name">
      <Orders />
    </Route>
  );

  expect(JSON.parse(container.textContent)).toMatchObject({
    id: "20",
    name: "carrot",
  });
  unmount();
});

it("returns empty if used outside of the pro", () => {
  act(() => history.pushState(null, "", "/orders/20/items/carrot"));

  const { unmount, container } = render(<Orders />);

  expect(JSON.parse(container.textContent)).toMatchObject({});
  unmount();
});

it("returns the params from the closest route if nested", () => {
  act(() => history.pushState(null, "", "/orders/20/items/carrot"));

  const { unmount, container } = render(
    <Route path="/orders/:id+">
      <Route path="/orders/:id/items/:name" component={Orders} />
    </Route>
  );

  expect(JSON.parse(container.textContent)).toMatchObject({
    id: "20",
    name: "carrot",
  });
  unmount();
});
