import { Path, BaseLocationHook } from "./use-location";

export type Parser = (route: Path) => { pattern: RegExp; keys: string[] };

// the object returned from `useRouter`
export interface RouterObject {
  readonly hook: BaseLocationHook;
  readonly base: Path;
  readonly ownBase: Path;
  readonly parser: Parser;
  readonly parent?: RouterObject;
  readonly ssrPath?: Path;
}

// basic options to construct a router
export type RouterOptions = {
  hook?: BaseLocationHook;
  base?: Path;
  parser?: Parser;
  parent?: RouterObject;
  ssrPath?: Path;
};
