import { afterEach, describe, expect, spyOn, test } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
} from "@testing-library/react";
import { Window as HappyWindow } from "happy-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { spawnSync } from "node:child_process";
import {
  Link,
  Router,
  useLocation,
  useSearch,
  useSearchParams,
} from "../src/index.js";
import {
  browserLocation,
  navigate,
  useBrowserLocation,
  useHistoryState,
  useLocationProperty,
  useSearch as useBrowserSearch,
} from "../src/use-browser-location.js";

const windows: HappyWindow[] = [];
const createWindow = (path = "/") => {
  const target = new HappyWindow({ url: `https://wouter.dev${path}` });
  windows.push(target);
  return target as unknown as Window & typeof globalThis;
};

afterEach(async () => {
  cleanup();
  await Promise.all(windows.splice(0).map((target) => target.happyDOM.abort()));
});

describe("browserLocation", () => {
  test("preserves custom default-window snapshots through useLocationProperty", () => {
    const useHash = () =>
      useLocationProperty(
        () => location.hash,
        () => "#server"
      );
    const { result } = renderHook(useHash);
    expect(result.current).toBe("");
    act(() => navigate("/custom#client"));
    expect(result.current).toBe("#client");
    const Page = () => <>{useHash()}</>;
    expect(renderToStaticMarkup(<Page />)).toBe("#server");
  });

  test("isolates pathname, search, state and navigation between windows", () => {
    const leftWindow = createWindow("/left?sort=name");
    const rightWindow = createWindow("/right?sort=date");
    const left = browserLocation({ window: leftWindow });
    const right = browserLocation({ window: rightWindow });
    let rightRenders = 0;
    const { result: leftResult, rerender } = renderHook(() => ({
      location: left.hook(),
      search: left.searchHook(),
      state: left.useHistoryState(),
    }));
    const { result: rightResult } = renderHook(() => {
      rightRenders++;
      return {
        location: right.hook(),
        search: right.searchHook(),
        state: right.useHistoryState(),
      };
    });
    const { result: globalResult } = renderHook(() => useBrowserLocation());

    expect(leftResult.current.location[0]).toBe("/left");
    expect(leftResult.current.search).toBe("?sort=name");
    expect(rightResult.current.location[0]).toBe("/right");
    expect(rightResult.current.search).toBe("?sort=date");
    const previousRenders = rightRenders;
    const initialLength = leftWindow.history.length;

    act(() => left.navigate("/next?sort=price", { state: { page: 2 } }));
    expect(leftResult.current.location[0]).toBe("/next");
    expect(leftResult.current.search).toBe("?sort=price");
    expect(leftResult.current.state).toEqual({ page: 2 });
    expect(leftWindow.history.length).toBe(initialLength + 1);
    expect(rightResult.current.location[0]).toBe("/right");
    expect(rightResult.current.state).toBeNull();
    expect(rightRenders).toBe(previousRenders);
    expect(globalResult.current[0]).toBe("/");

    act(() =>
      leftResult.current.location[1](
        new URL("https://wouter.dev/replaced?q=1"),
        { replace: true }
      )
    );
    expect(leftResult.current.location[0]).toBe("/replaced");
    expect(leftResult.current.search).toBe("?q=1");
    expect(leftResult.current.state).toBeNull();
    expect(leftWindow.history.length).toBe(initialLength + 1);
    rerender();
    expect(leftResult.current.location[1]).toBe(left.navigate);

    act(() => right.navigate("/right/next"));
    expect(rightResult.current.location[0]).toBe("/right/next");
    expect(leftResult.current.location[0]).toBe("/replaced");
    act(() => navigate("/parent"));
    expect(globalResult.current[0]).toBe("/parent");
    expect(leftWindow.location.pathname).toBe("/replaced");
    expect(rightWindow.location.pathname).toBe("/right/next");
  });

  test("inherits the scoped search hook for routes, links and search params", () => {
    const target = createWindow("/app/products?sort=name");
    const scoped = browserLocation({ window: target });
    const Page = () => {
      const [path] = useLocation();
      const search = useSearch();
      const [params, setParams] = useSearchParams();
      return (
        <>
          <output>{`${path}|${search}`}</output>
          <Link href="/details?sort=date" state={{ from: "products" }}>
            Details
          </Link>
          <button
            onClick={() => setParams({ sort: "price" }, { replace: true })}
          >
            Sort by price
          </button>
          <span>{params.get("sort")}</span>
        </>
      );
    };
    const { getByRole, getByText } = render(
      <Router base="/app" hook={scoped.hook}>
        <Page />
      </Router>
    );
    expect(getByRole("status").textContent).toBe("/products|sort=name");
    expect(getByRole("link").getAttribute("href")).toBe(
      "/app/details?sort=date"
    );
    fireEvent.click(getByRole("link"));
    expect(target.location.pathname).toBe("/app/details");
    expect(target.history.state).toEqual({ from: "products" });
    expect(getByRole("status").textContent).toBe("/details|sort=date");
    const length = target.history.length;
    fireEvent.click(getByRole("button"));
    expect(target.location.search).toBe("?sort=price");
    expect(target.history.length).toBe(length);
    expect(getByText("price")).toBeTruthy();
    expect(location.pathname).toBe("/");
    expect(location.search).toBe("");
  });

  test("patches the owning history once and dispatches events in its realm", () => {
    const target = createWindow();
    class ScopedEvent extends target.Event {}
    target.Event = ScopedEvent;
    const seen: Event[] = [];
    target.addEventListener("pushState", (event) => seen.push(event));
    target.addEventListener("replaceState", (event) => seen.push(event));
    const scoped = browserLocation({ window: target });
    const pushState = target.history.pushState;
    const replaceState = target.history.replaceState;
    expect(browserLocation({ window: target })).toBe(scoped);
    expect(target.history.pushState).toBe(pushState);
    expect(target.history.replaceState).toBe(replaceState);
    const { result } = renderHook(() => scoped.hook());

    act(() => target.history.pushState({ raw: true }, "", "/raw"));
    act(() => target.history.replaceState(null, "", "/raw/replace"));
    expect(result.current[0]).toBe("/raw/replace");
    expect(seen).toHaveLength(2);
    expect(seen.every((event) => event instanceof ScopedEvent)).toBe(true);
    expect(
      Array.from((seen[0] as Event & { arguments: IArguments }).arguments)
    ).toEqual([{ raw: true }, "", "/raw"]);
  });

  test("subscribes to native history and hash events on the supplied window", () => {
    const target = createWindow();
    const unpatchedReplace = target.history.replaceState;
    const scoped = browserLocation({ window: target });
    const { result } = renderHook(() => ({
      path: scoped.hook()[0],
      search: scoped.searchHook(),
      state: scoped.useHistoryState(),
    }));
    act(() => {
      unpatchedReplace.call(target.history, { back: true }, "", "/back?q=1");
      target.dispatchEvent(new target.PopStateEvent("popstate"));
    });
    expect(result.current).toEqual({
      path: "/back",
      search: "?q=1",
      state: { back: true },
    });
    act(() => {
      unpatchedReplace.call(target.history, null, "", "/hash?q=2#section");
      target.dispatchEvent(new target.HashChangeEvent("hashchange"));
    });
    expect(result.current).toEqual({
      path: "/hash",
      search: "?q=2",
      state: null,
    });
  });

  test("shares one listener per event, detaches after the last hook, and remounts", () => {
    const target = createWindow();
    const scoped = browserLocation({ window: target });
    const add = spyOn(target, "addEventListener");
    const remove = spyOn(target, "removeEventListener");
    const first = renderHook(() => {
      scoped.hook();
      scoped.searchHook();
      scoped.useHistoryState();
    });
    const second = renderHook(() => browserLocation({ window: target }).hook());
    expect(add.mock.calls.map(([event]) => event)).toEqual([
      "popstate",
      "pushState",
      "replaceState",
      "hashchange",
    ]);
    first.rerender();
    expect(add).toHaveBeenCalledTimes(4);
    first.unmount();
    expect(remove).not.toHaveBeenCalled();
    second.unmount();
    expect(remove).toHaveBeenCalledTimes(4);
    remove.mock.calls.forEach(([event, listener], index) => {
      expect(event).toBe(add.mock.calls[index][0]);
      expect(listener).toBe(add.mock.calls[index][1]);
    });

    scoped.navigate("/while-unmounted");
    const third = renderHook(() => scoped.hook());
    expect(third.result.current[0]).toBe("/while-unmounted");
    expect(add).toHaveBeenCalledTimes(8);
    act(() => scoped.navigate("/remounted"));
    expect(third.result.current[0]).toBe("/remounted");
    third.unmount();
    expect(remove).toHaveBeenCalledTimes(8);
    add.mockRestore();
    remove.mockRestore();
  });

  test("switches windows without retaining a subscription to the old window", () => {
    const firstWindow = createWindow("/first");
    const secondWindow = createWindow("/second");
    const first = browserLocation({ window: firstWindow });
    const second = browserLocation({ window: secondWindow });
    const remove = spyOn(firstWindow, "removeEventListener");
    const { result, rerender } = renderHook(({ scoped }) => scoped.hook(), {
      initialProps: { scoped: first },
    });
    expect(result.current[0]).toBe("/first");
    rerender({ scoped: second });
    expect(result.current[0]).toBe("/second");
    expect(result.current[1]).toBe(second.navigate);
    expect(remove).toHaveBeenCalledTimes(4);
    act(() => first.navigate("/old"));
    expect(result.current[0]).toBe("/second");
    act(() => second.navigate("/new"));
    expect(result.current[0]).toBe("/new");
    remove.mockRestore();
  });

  test("uses the existing default hooks when no window or the global window is supplied", () => {
    for (const scoped of [browserLocation(), browserLocation({ window })]) {
      expect(scoped.hook === useBrowserLocation).toBe(true);
      expect(scoped.searchHook).toBe(useBrowserSearch);
      expect(scoped.hook.searchHook).toBe(useBrowserSearch);
      expect(scoped.navigate).toBe(navigate);
      expect(scoped.useHistoryState).toBe(useHistoryState);
    }
  });

  test("supports SSR snapshots and initialization without browser globals", () => {
    const target = createWindow("/client?source=client");
    const scoped = browserLocation({ window: target });
    scoped.navigate("/client?source=client", { state: { client: true } });
    const Page = ({ path, search }: { path?: string; search?: string }) => (
      <>{`${scoped.hook({ ssrPath: path })[0]}|${scoped.searchHook({
        ssrSearch: search,
      })}|${scoped.useHistoryState()}`}</>
    );
    const descriptors = ["window", "location", "history"].map(
      (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)!] as const
    );
    descriptors.forEach(([key]) => Reflect.deleteProperty(globalThis, key));
    try {
      expect(browserLocation().navigate).toBe(navigate);
      expect(browserLocation({ window: target }).hook).toBe(scoped.hook);
      expect(
        renderToStaticMarkup(<Page path="/server" search="?source=server" />)
      ).toBe("/server|?source=server|null");
      expect(renderToStaticMarkup(<Page path="" search="" />)).toBe("||null");
      expect(renderToStaticMarkup(<Page />)).toBe(
        "/client|?source=client|null"
      );
    } finally {
      descriptors.forEach(([key, descriptor]) =>
        Object.defineProperty(globalThis, key, descriptor)
      );
    }
  });

  test("can be imported and rendered in a process without a DOM", () => {
    const moduleUrl = new URL("../src/use-browser-location.js", import.meta.url)
      .href;
    const result = spawnSync(
      process.execPath,
      [
        "--eval",
        `
      import { createElement } from "react";
      import { renderToString } from "react-dom/server";
      import { browserLocation } from ${JSON.stringify(moduleUrl)};
      if (typeof window !== "undefined") throw new Error("Unexpected browser globals");
      const scoped = browserLocation();
      function Page() {
        const [path] = scoped.hook({ ssrPath: "/server" });
        const search = scoped.searchHook({ ssrSearch: "?q=ssr" });
        const state = scoped.useHistoryState();
        return createElement("p", null, path + search + ":" + state);
      }
      console.log(renderToString(createElement(Page)));
    `,
      ],
      { encoding: "utf8" }
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout.trim()).toBe("<p>/server?q=ssr:null</p>");
  });
});
