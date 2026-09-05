import { expect, test } from "bun:test";
import { act, render } from "@testing-library/react";
import { ReactNode, useEffect, useSyncExternalStore } from "react";
import { Route, Switch, useRoute } from "../src/index.js";

test("keeps Switch children consistent across native popstate listeners", () => {
  const eventName = "popstate";
  // Native browser events can run a microtask between listeners. Stop the
  // event after the child subscribes to reproduce a render before Switch
  // receives the update, which synchronous dispatchEvent otherwise hides.
  const subscribe = (callback: () => void) => {
    const listener = (event: Event) => {
      event.stopImmediatePropagation();
      callback();
    };
    addEventListener(eventName, listener);
    return () => removeEventListener(eventName, listener);
  };

  const InterruptEvent = ({ children }: { children: ReactNode }) => {
    useSyncExternalStore(subscribe, () => true);
    return <>{children}</>;
  };

  const renders: string[] = [];
  const effects: string[] = [];
  const Detail = () => {
    const [, params] = useRoute("/characters/:id");
    renders.push(params!.id);
    useEffect(() => {
      effects.push(params!.id);
    });
    return null;
  };

  history.replaceState(null, "", "/characters/new");
  history.pushState(null, "", "/characters/123");

  const { container } = render(
    <Switch>
      <Route path="/characters/new">New character</Route>
      <Route path="/characters/:id">
        <InterruptEvent>
          <Detail />
        </InterruptEvent>
      </Route>
    </Switch>
  );

  act(() => {
    history.back();
    dispatchEvent(new Event(eventName));
  });

  expect(renders).toEqual(["123"]);
  expect(effects).toEqual(["123"]);
  expect(container).toHaveTextContent("New character");
});
