import { renderHook } from "@testing-library/react-hooks";
import staticLocation from "../static-location.js";

it("is a static hook factory", () => {
  const hook = staticLocation("/never-gonna-give");
  const {
    result: { current: value }
  } = renderHook(() => hook());

  expect(value).toBe("/never-gonna-give");
});
