/*
 * Foundation: useLocation and paths
 */

export type Path = string;

export type SearchString = string;

// the base useLocation hook type. Any custom hook (including the
// default one) should inherit from it.
export type BaseLocationHook = (
  ...args: any[]
) => [Path, (path: Path, ...args: any[]) => any];

export type BaseSearchHook = (...args: any[]) => SearchString;

/*
 * Utility types that operate on hook
 */

// Returns the type of the location tuple of the given hook.
export type HookReturnValue<H extends BaseLocationHook> = ReturnType<H>;

// Utility type that allows us to distinguish between hooks that
// don't receive any options and `BaseLocationHook` that can accept anything
type ArbitraryObjectWhenNever<T> = 0 extends 1 & T
  ? { [key: string]: any }
  : [T] extends [never]
  ? {}
  : T;

// Returns the type of the navigation options that hook's push function accepts.
export type HookNavigationOptions<H extends BaseLocationHook> =
  ArbitraryObjectWhenNever<
    NonNullable<Parameters<HookReturnValue<H>[1]>[1]> // get's the second argument of a tuple returned by the hook
  >;
