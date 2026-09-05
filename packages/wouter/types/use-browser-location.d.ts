import type { Path, SearchString } from "./location-hook.js";
import type { NavigateOptions } from "./router.js";

export const useLocationProperty: <S>(fn: () => S, ssrFn?: () => S) => S;

export type BrowserSearchHook = (options?: {
  ssrSearch?: SearchString;
}) => SearchString;

export const useSearch: BrowserSearchHook;

export const usePathname: (options?: { ssrPath?: Path }) => Path;

export const useHistoryState: <T = any>() => T;

export const navigate: <S = any>(
  to: string | URL,
  options?: NavigateOptions<S>
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
