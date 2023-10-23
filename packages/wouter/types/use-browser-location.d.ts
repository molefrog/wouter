import { Path } from "./location-hook";

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

export const navigate: <S = any>(
  to: string | URL,
  options?: { replace?: boolean; state?: S }
) => void;

/*
 * Default `useLocation`
 */

// The type of the default `useLocation` hook that wouter uses.
// It operates on current URL using History API, supports base path and can
// navigate with `pushState` or `replaceState`.
export type BrowserLocationHook = (options?: {
  ssrPath?: Path;
}) => [Path, typeof navigate];

export const useBrowserLocation: BrowserLocationHook;
