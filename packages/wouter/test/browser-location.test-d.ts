import { expectTypeOf } from "bun:test";
import {
  browserLocation,
  BrowserSearchHook,
} from "../src/use-browser-location.js";
import { browserLocation as preactBrowserLocation } from "../../wouter-preact/types/use-browser-location.js";
import { BaseLocationHook } from "../types/location-hook.js";

for (const initialize of [browserLocation, preactBrowserLocation]) {
  const scoped = initialize({ window });
  const [path, navigate] = scoped.hook({ ssrPath: "/server" });
  expectTypeOf(path).toEqualTypeOf<string>();
  expectTypeOf(scoped.hook).toMatchTypeOf<BaseLocationHook>();
  expectTypeOf(scoped.hook.searchHook).toEqualTypeOf<BrowserSearchHook>();
  expectTypeOf(
    scoped.searchHook({ ssrSearch: "?server" })
  ).toEqualTypeOf<string>();
  expectTypeOf(scoped.useHistoryState<{ page: number }>()).toEqualTypeOf<{
    page: number;
  }>();
  navigate("/next", { replace: true, state: { page: 2 }, transition: true });
  scoped.navigate(new URL("https://wouter.dev/next"));
  initialize();
  initialize({});
  // @ts-expect-error The target must be a window, not a document.
  initialize({ window: document });
  // @ts-expect-error Unknown initialization options are rejected.
  initialize({ target: window });
  // @ts-expect-error Navigation still requires a destination.
  navigate();
  // @ts-expect-error Unknown navigation options are rejected.
  scoped.navigate("/next", { unknown: true });
}
