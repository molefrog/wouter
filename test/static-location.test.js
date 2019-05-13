import { renderHook, act } from "react-hooks-testing-library";
import staticLocation from "../static-location.js";

it("is a static hook factory", () => {
  const hook = staticLocation("/never-gonna-give");
  const {
    result: {
      current: [value, update]
    }
  } = renderHook(() => hook());

  expect(value).toBe("/never-gonna-give");
  expect(update).toBeInstanceOf(Function);
});

it("doesn't change the value even if updated", () => {
  const hook = staticLocation("/try-changing-me");
  const { result } = renderHook(() => hook());
  const [, update] = result.current;

  act(() => {
    update("/change");
  });

  expect(result.current[0]).toBe("/try-changing-me");
});
