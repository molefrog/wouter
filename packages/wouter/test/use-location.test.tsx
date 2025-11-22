import { ComponentProps, ReactNode } from "react";
import { it, expect, describe, beforeEach } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { Router, useLocation } from "../src/index.js";
import {
  useBrowserLocation,
  navigate as browserNavigation,
} from "../src/use-browser-location.js";

import {
  useHashLocation,
  navigate as hashNavigation,
} from "../src/use-hash-location.js";
import { waitForHashChangeEvent } from "./test-utils";

import { memoryLocation } from "../src/memory-location.js";

function createContainer(
  options: Omit<ComponentProps<typeof Router>, "children"> = {}
) {
  return ({ children }: { children: ReactNode }) => (
    <Router {...options}>{children}</Router>
  );
}

const memory = memoryLocation({ record: true });

describe.each([
  {
    name: "useBrowserLocation",
    hook: useBrowserLocation,
    location: () => location.pathname,
    navigate: browserNavigation,
    act,
    clear: () => {
      history.replaceState(null, "", "/");
    },
  },
  {
    name: "useHashLocation",
    hook: useHashLocation,
    location: () => "/" + location.hash.replace(/^#?\/?/, ""),
    navigate: hashNavigation,
    act: (cb: () => void) => waitForHashChangeEvent(() => act(cb)),
    clear: () => {
      location.hash = "";
      history.replaceState(null, "", "/");
    },
  },
  {
    name: "memoryLocation",
    hook: memory.hook,
    location: () => memory.history.at(-1) ?? "",
    navigate: memory.navigate,
    act,
    clear: () => {
      memory.reset();
    },
  },
])("$name", (stub) => {
  beforeEach(() => stub.clear());

  it("returns a pair [value, update]", () => {
    const { result, unmount } = renderHook(() => useLocation(), {
      wrapper: createContainer({ hook: stub.hook }),
    });
    const [value, update] = result.current;

    expect(typeof value).toBe("string");
    expect(typeof update).toBe("function");
    unmount();
  });

  describe("`value` first argument", () => {
    it("returns `/` when URL contains only a basepath", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/app",
          hook: stub.hook,
        }),
      });

      await stub.act(() => stub.navigate("/app"));
      expect(result.current[0]).toBe("/");
      unmount();
    });

    it("basepath should be case-insensitive", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/MyApp",
          hook: stub.hook,
        }),
      });

      await stub.act(() => stub.navigate("/myAPP/users/JohnDoe"));
      expect(result.current[0]).toBe("/users/JohnDoe");
      unmount();
    });

    it("returns an absolute path in case of unmatched base path", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/MyApp",
          hook: stub.hook,
        }),
      });

      await stub.act(() => stub.navigate("/MyOtherApp/users/JohnDoe"));
      expect(result.current[0]).toBe("~/MyOtherApp/users/JohnDoe");
      unmount();
    });

    it("automatically unescapes specials characters", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          hook: stub.hook,
        }),
      });

      await stub.act(() =>
        stub.navigate("/пользователи/показать все/101/げんきです")
      );
      expect(result.current[0]).toBe(
        "/пользователи/показать все/101/げんきです"
      );

      await stub.act(() => stub.navigate("/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B"));
      expect(result.current[0]).toBe("/шеллы");
      unmount();
    });

    it("can accept unescaped basepaths", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/hello мир", // basepath is not escaped
          hook: stub.hook,
        }),
      });

      await stub.act(() => stub.navigate("/hello%20%D0%BC%D0%B8%D1%80/rel"));
      expect(result.current[0]).toBe("/rel");

      unmount();
    });

    it("can accept unescaped basepaths", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/hello%20%D0%BC%D0%B8%D1%80", // basepath is already escaped
          hook: stub.hook,
        }),
      });

      await stub.act(() => stub.navigate("/hello мир/rel"));
      expect(result.current[0]).toBe("/rel");

      unmount();
    });
  });

  describe("`update` second parameter", () => {
    it("rerenders the component", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({ hook: stub.hook }),
      });
      const update = result.current[1];

      await stub.act(() => update("/about"));
      expect(stub.location()).toBe("/about");
      unmount();
    });

    it("stays the same reference between re-renders (function ref)", () => {
      const { result, rerender, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({ hook: stub.hook }),
      });

      const updateWas = result.current[1];
      rerender();
      const updateNow = result.current[1];

      expect(updateWas).toBe(updateNow);
      unmount();
    });

    it("supports a basepath", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/app",
          hook: stub.hook,
        }),
      });

      const update = result.current[1];

      await stub.act(() => update("/dashboard"));
      expect(stub.location()).toBe("/app/dashboard");
      unmount();
    });

    it("ignores the '/' basepath", async () => {
      const { result, unmount } = renderHook(() => useLocation(), {
        wrapper: createContainer({
          base: "/",
          hook: stub.hook,
        }),
      });

      const update = result.current[1];

      await stub.act(() => update("/dashboard"));
      expect(stub.location()).toBe("/dashboard");
      unmount();
    });
  });
});
