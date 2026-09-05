import { renderHook, act } from "@testing-library/react";
import { useSearch, Router } from "../src/index.js";
import { navigate } from "../src/use-browser-location.js";
import { memoryLocation } from "../src/memory-location.js";
import { test, expect } from "bun:test";
import { useState } from "react";

test("revisits the initial search after a render-phase state update (#393)", () => {
  history.replaceState(null, "", "/?tab=1");

  const { result } = renderHook(() => {
    const search = useSearch();
    // Minimal equivalent of urql synchronizing query state during render.
    // React 18 drops this update without our fresh-snapshot-getter adapter:
    // https://github.com/facebook/react/pull/25578
    const [previousSearch, setPreviousSearch] = useState(search);
    if (previousSearch !== search) setPreviousSearch(search);
    return search;
  });

  expect(result.current).toBe("tab=1");
  for (const tab of [2, 1, 3, 1]) {
    act(() => navigate(`/?tab=${tab}`));
    expect(location.search).toBe(`?tab=${tab}`);
    expect(result.current).toBe(`tab=${tab}`);
  }
});

test("returns browser search string", () => {
  history.replaceState(null, "", "/users?active=true");
  const { result } = renderHook(() => useSearch());

  expect(result.current).toEqual("active=true");
});

test("returns search string as-is when it contains malformed escapes", () => {
  history.replaceState(null, "", "/users?q=100%");
  const { result } = renderHook(() => useSearch());

  // decodeURI throws on "%", sanitizeSearch falls back to the raw string
  expect(result.current).toEqual("q=100%");
});

test("can be customized in the Router", () => {
  const customSearchHook = ({ customOption = "unused" }) => "none";

  const { result } = renderHook(() => useSearch(), {
    wrapper: (props) => {
      return <Router searchHook={customSearchHook}>{props.children}</Router>;
    },
  });

  expect(result.current).toEqual("none");
});

test("can be customized with memoryLocation", () => {
  const { searchHook } = memoryLocation({ path: "/foo?key=value" });

  const { result } = renderHook(() => useSearch(), {
    wrapper: (props) => {
      return <Router searchHook={searchHook}>{props.children}</Router>;
    },
  });

  expect(result.current).toEqual("key=value");
});

test("can be customized with memoryLocation using search path parameter", () => {
  const { searchHook } = memoryLocation({
    path: "/foo?key=value",
    searchPath: "foo=bar",
  });

  const { result } = renderHook(() => useSearch(), {
    wrapper: (props) => {
      return <Router searchHook={searchHook}>{props.children}</Router>;
    },
  });

  expect(result.current).toEqual("key=value&foo=bar");
});

test("auto-inherits searchHook from hook when not explicitly provided", () => {
  const { hook } = memoryLocation({ path: "/foo?key=value" });

  const { result } = renderHook(() => useSearch(), {
    wrapper: (props) => {
      // Only pass hook, not searchHook - it should auto-inherit!
      return <Router hook={hook}>{props.children}</Router>;
    },
  });

  expect(result.current).toEqual("key=value");
});

test("unescapes search string", () => {
  const { result: searchResult } = renderHook(() => useSearch());

  expect(searchResult.current).toBe("");

  act(() => navigate("/?nonce=not Found&country=საქართველო"));
  expect(searchResult.current).toBe("nonce=not Found&country=საქართველო");

  // question marks
  act(() => navigate("/?вопрос=как дела?"));
  expect(searchResult.current).toBe("вопрос=как дела?");
});

test("is safe against parameter injection", () => {
  history.replaceState(null, "", "/?search=foo%26parameter_injection%3Dbar");
  const { result } = renderHook(() => useSearch());

  const searchParams = new URLSearchParams(result.current);
  const query = Object.fromEntries(searchParams.entries());

  expect(query).toEqual({ search: "foo&parameter_injection=bar" });
});
