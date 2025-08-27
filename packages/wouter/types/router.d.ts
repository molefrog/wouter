import {
  Path,
  SearchString,
  BaseLocationHook,
  BaseSearchHook,
} from "./location-hook.js";

export type Parser = (
  route: Path,
  loose?: boolean
) => { pattern: RegExp; keys: string[] };

export type HrefsFormatter = (href: string, router: RouterObject) => string;

// the object returned from `useRouter`
export interface RouterObject {
  readonly hook: BaseLocationHook;
  readonly searchHook: BaseSearchHook;
  readonly base: Path;
  readonly ownBase: Path;
  readonly parser: Parser;
  readonly ssrPath?: Path;
  readonly ssrSearch?: SearchString;
  readonly hrefs: HrefsFormatter;
}

// state captured during SSR render
export type SsrContext = {
  // if a redirect was encountered, this will be populated with the path
  redirectTo?: Path;
};

// basic options to construct a router
export type RouterOptions = {
  hook?: BaseLocationHook;
  searchHook?: BaseSearchHook;
  base?: Path;
  parser?: Parser;
  ssrPath?: Path;
  ssrSearch?: SearchString;
  ssrContext?: SsrContext;
  hrefs?: HrefsFormatter;
};

export const defaultParser: Parser;
export const defaultRouter: RouterObject;
