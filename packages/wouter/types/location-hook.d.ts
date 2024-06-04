/*
 * Foundation: useLocation and paths
 */

export type Path = string;

export type PathPattern = string | RegExp;

export type SearchString = string;

export type URLSearchParamsInit = ConstructorParameters<
  typeof URLSearchParams
>[0];

// the base useLocation hook type. Any custom hook (including the
// default one) should inherit from it.
export type BaseLocationHook = (
  ...args: any[]
) => [Path, (path: Path, ...args: any[]) => any];

export type BaseSearchHook = (...args: any[]) => SearchString;

export type BaseSearchParamsHook = (
  ...args: Parameters<BaseSearchHook>
) => [
  URLSearchParams,
  (
    nextInit:
      | URLSearchParamsInit
      | ((prev: URLSearchParams) => URLSearchParamsInit),
    ...args: Parameters<ReturnType<BaseLocationHook>[1]> extends [
      infer _,
      ...infer Args
    ]
      ? Args
      : never
  ) => void
];

/*
 * Utility types that operate on hook
 */

// Returns the type of the location tuple of the given hook.
export type HookReturnValue<H extends BaseLocationHook> = ReturnType<H>;

// Utility type that allows us to handle cases like `any` and `never`
type EmptyInterfaceWhenAnyOrNever<T> = 0 extends 1 & T
  ? {}
  : [T] extends [never]
  ? {}
  : T;

// Returns the type of the navigation options that hook's push function accepts.
export type HookNavigationOptions<H extends BaseLocationHook> =
  EmptyInterfaceWhenAnyOrNever<
    NonNullable<Parameters<HookReturnValue<H>[1]>[1]> // get's the second argument of a tuple returned by the hook
  >;
