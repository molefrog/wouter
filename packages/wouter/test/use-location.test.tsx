import { ComponentProps, ReactNode } from "react";
import { it, expect, describe, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Router, useLocation } from "wouter";
import {
  useBrowserLocation,
  navigate as browserNavigation,
  BaseLocationHook,
} from "wouter/use-browser-location";

import {
  useHashLocation,
  navigate as hashNavigation,
} from "wouter/use-hash-location";

import { memoryLocation } from "wouter/memory-location";

function createContainer(
  options: Omit<ComponentProps<typeof Router>, "children"> = {}
) {
  return ({ children }: { children: ReactNode }) => (
    <Router {...options}>{children}</Router>
  );
}

type StubType = {
  name: string;
  hook: BaseLocationHook;
  location: () => string;
  navigate: ReturnType<BaseLocationHook>[1];
  act: (cb: () => void) => Promise<void>;
  clear: () => void;
};

const waitForHashChangeEvent = async (cb: () => void, throwAfter = 1000) =>
  new Promise<void>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;

    const onChange = () => {
      resolve();
      clearTimeout(timeout);
      window.removeEventListener("hashchange", onChange);
    };

    window.addEventListener("hashchange", onChange);
    cb();

    timeout = setTimeout(() => {
      reject(new Error("Timed out: `hashchange` event did not fire!"));
      window.removeEventListener("hashchange", onChange);
    }, throwAfter);
  });

function createLocationSpec(stub: StubType) {
  describe(stub.name, () => {
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
    });
  });
}

createLocationSpec({
  name: "useBrowserLocation",
  hook: useBrowserLocation,
  location: () => location.pathname,
  navigate: browserNavigation,
  act,
  clear: () => {
    history.replaceState(null, "", "/");
  },
});

createLocationSpec({
  name: "useHashLocation",
  hook: useHashLocation,
  location: () => "/" + location.hash.replace(/^#?\/?/, ""),
  navigate: hashNavigation,
  act: (cb) => waitForHashChangeEvent(() => act(cb)),
  clear: () => {
    location.hash = "";
    history.replaceState(null, "", "/");
  },
});

const memory = memoryLocation({ record: true });
createLocationSpec({
  name: "memoryLocation",
  hook: memory.hook,
  location: () => memory.history.at(-1) ?? "",
  navigate: memory.navigate,
  act,
  clear: () => null,
});
