import {
  Path,
  SearchString,
  BaseLocationHook,
  BaseSearchHook,
} from "./location-hook";

export type Parser = (route: Path) => { pattern: RegExp; keys: string[] };

// the object returned from `useRouter`
export interface RouterObject {
  readonly hook: BaseLocationHook;
  readonly searchHook: BaseSearchHook;
  readonly base: Path;
  readonly ownBase: Path;
  readonly parser: Parser;
  readonly parent?: RouterObject;
  readonly ssrPath?: Path;
  readonly ssrSearch?: SearchString;
}

// basic options to construct a router
export type RouterOptions = {
  hook?: BaseLocationHook;
  searchHook?: BaseSearchHook;
  base?: Path;
  parser?: Parser;
  parent?: RouterObject;
  ssrPath?: Path;
  ssrSearch?: SearchString;
};
