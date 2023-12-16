import { it, assertType, expectTypeOf, describe, expect } from "vitest";
import {
  BaseLocationHook,
  HookNavigationOptions,
  HookReturnValue,
} from "wouter";

describe("`HookNavigationOptions` utility type", () => {
  it("should return empty interface for hooks with no nav options", () => {
    const hook = (): [string, (path: string) => void] => {
      return ["stub", (path: string) => {}];
    };

    type A = HookReturnValue<typeof hook>[1];
    type Options = HookNavigationOptions<typeof hook>;

    expectTypeOf<Options>().toEqualTypeOf<{}>();

    const optionsExt: Options | { a: 1 } = { a: 1, b: 2 };
  });

  it("should return object with required navigation params", () => {
    const hook = (): [
      string,
      (path: string, options: { replace: boolean; optional?: number }) => void
    ] => {
      return ["stub", () => {}];
    };

    type Options = HookNavigationOptions<typeof hook>;

    // @ts-expect-error
    expectTypeOf<Options>().toEqualTypeOf<{
      replace: boolean;
      foo: string;
    }>();

    expectTypeOf<Options>().toEqualTypeOf<{
      replace: boolean;
      optional?: number;
    }>();
  });

  it("should not contain never when options are optional", () => {
    const hook = (
      param: string
    ): [string, (path: string, options?: { replace: boolean }) => void] => {
      return ["stub", () => {}];
    };

    type Options = HookNavigationOptions<typeof hook>;

    expectTypeOf<Options>().toEqualTypeOf<{
      replace: boolean;
    }>();
  });

  it("should only support valid hooks", () => {
    // @ts-expect-error
    type A = HookNavigationOptions<string>;
    // @ts-expect-error
    type B = HookNavigationOptions<{}>;
    // @ts-expect-error
    type C = HookNavigationOptions<() => []>;
  });
});
