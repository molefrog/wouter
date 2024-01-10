import { renderHook, act } from "@testing-library/react";
import { useSearch, Router } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { it, expect, beforeEach } from "vitest";

beforeEach(() => history.replaceState(null, "", "/"));

it("returns browser search string", () => {
  history.replaceState(null, "", "/users?active=true");
  const { result } = renderHook(() => useSearch());

  expect(result.current).toEqual("active=true");
});

it("can be customized in the Router", () => {
  const customSearchHook = ({ customOption = "unused" }) => "none";

  const { result } = renderHook(() => useSearch(), {
    wrapper: (props) => {
      return <Router searchHook={customSearchHook}>{props.children}</Router>;
    },
  });

  expect(result.current).toEqual("none");
});

it("unescapes search string", () => {
  const { result: searchResult } = renderHook(() => useSearch());

  expect(searchResult.current).toBe("");

  act(() => navigate("/?nonce=not Found&country=საქართველო"));
  expect(searchResult.current).toBe("nonce=not Found&country=საქართველო");

  // question marks
  act(() => navigate("/?вопрос=как дела?"));
  expect(searchResult.current).toBe("вопрос=как дела?");
});

it("is safe against parameter injection", () => {
  history.replaceState(null, "", "/?search=foo%26parameter_injection%3Dbar");
  const { result } = renderHook(() => useSearch());

  const searchParams = new URLSearchParams(result.current);
  const query = Object.fromEntries(searchParams.entries());

  expect(query).toEqual({ search: "foo&parameter_injection=bar" });
});
