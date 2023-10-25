import { renderHook } from "@testing-library/react";
import { useSearch, Router } from "wouter";
import { it, expect } from "vitest";

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
