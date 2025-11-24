import { renderHook, act } from "@testing-library/react";
import { useSearchParams, Router } from "../src/index.js";
import { navigate } from "../src/use-browser-location.js";
import { it, expect, beforeEach } from "bun:test";

beforeEach(() => history.replaceState(null, "", "/"));

it("can return browser search params", () => {
  history.replaceState(null, "", "/users?active=true");
  const { result } = renderHook(() => useSearchParams());

  expect(result.current[0].get("active")).toBe("true");
});

it("can change browser search params", () => {
  history.replaceState(null, "", "/users?active=true");
  const { result } = renderHook(() => useSearchParams());

  expect(result.current[0].get("active")).toBe("true");

  act(() =>
    result.current[1]((prev) => {
      prev.set("active", "false");
      return prev;
    })
  );

  expect(result.current[0].get("active")).toBe("false");
});

it("can be customized in the Router", () => {
  const customSearchHook = ({ customOption = "unused" }) => "none";

  const { result } = renderHook(() => useSearchParams(), {
    wrapper: (props) => {
      return <Router searchHook={customSearchHook}>{props.children}</Router>;
    },
  });

  expect(Array.from(result.current[0].keys())).toEqual(["none"]);
});

it("unescapes search string", () => {
  const { result: searchResult } = renderHook(() => useSearchParams());

  expect(Array.from(searchResult.current[0].keys()).length).toBe(0);

  act(() => navigate("/?nonce=not Found&country=საქართველო"));
  expect(searchResult.current[0].get("nonce")).toBe("not Found");
  expect(searchResult.current[0].get("country")).toBe("საქართველო");

  // question marks
  act(() => navigate("/?вопрос=как дела?"));
  expect(searchResult.current[0].get("вопрос")).toBe("как дела?");
});

it("is safe against parameter injection", () => {
  history.replaceState(null, "", "/?search=foo%26parameter_injection%3Dbar");
  const { result } = renderHook(() => useSearchParams());

  expect(result.current[0].get("search")).toBe("foo&parameter_injection=bar");
});
