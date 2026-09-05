import { test, expectTypeOf } from "bun:test";
import { useSearchParams, type SetSearchParams } from "../src/index.js";
import { memoryLocation } from "../src/memory-location.js";

test("accepts readonly search entries and all standard navigation options", () => {
  const [params, setParams] = useSearchParams();
  expectTypeOf(params).toEqualTypeOf<URLSearchParams>();
  expectTypeOf(setParams).toEqualTypeOf<SetSearchParams>();
  setParams([["q", "hello"]] as const, { transition: true });
  setParams(() => [["page", "2"]] as const, { replace: true });
  setParams(undefined);
});

test("preserves the navigation state type of a memory hook", () => {
  const memory = memoryLocation<{ from: string }>();
  const [, setParams] = useSearchParams<typeof memory.hook>();
  setParams("q=hello", { state: { from: "/" }, transition: true });
  setParams({ q: "hello" });
  // @ts-expect-error State must conform to the custom hook.
  setParams("q=hello", { state: { from: 123 } });
});

test("preserves required options for a custom navigation hook", () => {
  type CustomHook = () => [
    string,
    (to: string, options: { token: string }) => void
  ];
  const [, setParams] = useSearchParams<CustomHook>();
  setParams("q=hello", { token: "session" });
  // @ts-expect-error This hook requires navigation options.
  setParams("q=hello");
  // @ts-expect-error This hook requires a token.
  setParams("q=hello", { replace: true });
  // @ts-expect-error The setter only forwards the options argument.
  setParams("q=hello", { token: "session" }, "extra");
});

test("forwards nullable navigation options unchanged", () => {
  type CustomHook = () => [
    string,
    (to: string, options?: { token: string } | null) => void
  ];
  const [, setParams] = useSearchParams<CustomHook>();
  setParams("q=hello", null);
  setParams("q=hello", undefined);
  setParams("q=hello");
  setParams("q=hello", { token: "session" });
  // @ts-expect-error The hook does not accept numbers.
  setParams("q=hello", 123);
});

test("keeps options required when a hook union contains a required branch", () => {
  type RequiredHook = () => [
    string,
    (to: string, options: { token: string }) => void
  ];
  type OptionalHook = () => [
    string,
    (to: string, options?: { token: string }) => void
  ];
  const [, setParams] = useSearchParams<RequiredHook | OptionalHook>();
  setParams("q=hello", { token: "session" });
  // @ts-expect-error Options must be safe for either possible hook.
  setParams("q=hello");
  // @ts-expect-error The required hook does not accept undefined.
  setParams("q=hello", undefined);
});
