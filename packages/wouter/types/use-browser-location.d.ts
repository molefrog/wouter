/*
 * Foundation: useLocation and paths
 */

export type Path = string;

// the base useLocation hook type. Any custom hook (including the
// default one) should inherit from it.
export type BaseLocationHook = (
  ...args: any[]
) => [Path, (path: Path, ...args: any[]) => any];

/*
 * Utility types that operate on hook
 */

// Returns the type of the location tuple of the given hook.
export type HookReturnValue<H extends BaseLocationHook> = ReturnType<H>;

// Returns the type of the navigation options that hook's push function accepts.
export type HookNavigationOptions<H extends BaseLocationHook> =
  HookReturnValue<H>[1] extends (
    path: Path,
    options: infer R,
    ...rest: any[]
  ) => any
    ? R extends { [k: string]: any }
      ? R
      : {}
    : {};

type Primitive = string | number | bigint | boolean | null | undefined | symbol;
export const useLocationProperty: <S extends Primitive>(
  fn: () => S,
  ssrFn?: () => S
) => S;

type SearchString = `?${string}` | "";
export const useSearch: (options?: {
  ssrSearch?: SearchString;
}) => SearchString;

export const usePathname: (options?: { ssrPath?: Path }) => Path;

export const useHistoryState: <T = any>() => T;

export const navigate: (
  to: string | URL,
  options?: { replace?: boolean; state?: any }
) => void;

/*
 * Default `useLocation`
 */

// The type of the default `useLocation` hook that wouter uses.
// It operates on current URL using History API, supports base path and can
// navigate with `pushState` or `replaceState`.
export type LocationHook = (options?: {
  ssrPath?: Path;
}) => [Path, typeof navigate];

export const useBrowserLocation: LocationHook;

export type LocationTuple = HookReturnValue<LocationHook>;
