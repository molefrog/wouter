import { renderHook, act } from "@testing-library/react";
import {
  useSearchParams,
  Router,
  BaseLocationHook,
  BaseSearchHook,
} from "wouter";
import { navigate } from "wouter/use-browser-location";
import { it, expect, beforeEach, vi } from "vitest";

beforeEach(() => history.replaceState(null, "", "/"));

it("returns browser url search params", () => {
  history.replaceState(null, "", "/users?active=true");
  const { result } = renderHook(() => useSearchParams());
  const [value] = result.current;

  expect(value.get("active")).toEqual("true");
});

it("can be customized in the Router", () => {
  const customSearchHook: BaseSearchHook = ({ customOption = "unused" }) =>
    "hello=world";
  const navigate = vi.fn();
  const customHook: BaseLocationHook = () => ["/foo", navigate];

  const { result } = renderHook(() => useSearchParams(), {
    wrapper: (props) => {
      return (
        <Router hook={customHook} searchHook={customSearchHook}>
          {props.children}
        </Router>
      );
    },
  });

  expect(result.current[0].get("hello")).toEqual("world");

  act(() => result.current[1]("active=false"));
  expect(navigate).toBeCalledTimes(1);
  expect(navigate).toBeCalledWith("?active=false", undefined);
});

it("unescapes search string", () => {
  const { result } = renderHook(() => useSearchParams());

  act(() => result.current[1]("?nonce=not Found&country=საქართველო"));
  expect(result.current[0].get("nonce")).toBe("not Found");
  expect(result.current[0].get("country")).toBe("საქართველო");

  // question marks
  act(() => result.current[1]("?вопрос=как дела?"));
  expect(result.current[0].get("вопрос")).toBe("как дела?");
});
