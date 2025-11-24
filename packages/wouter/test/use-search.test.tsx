import { renderHook, act, cleanup } from "@testing-library/react";
import { useSearch, Router } from "../src/index.js";
import { navigate } from "../src/use-browser-location.js";
import { memoryLocation } from "../src/memory-location.js";
import { test, expect, beforeEach, afterEach } from "bun:test";

beforeEach(() => history.replaceState(null, "", "/"));
afterEach(cleanup);

test("returns browser search string", () => {
  history.replaceState(null, "", "/users?active=true");
  const { result } = renderHook(() => useSearch());

  expect(result.current).toEqual("active=true");
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
