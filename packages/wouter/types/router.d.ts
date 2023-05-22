import { MatcherFn } from "./matcher";
import { Path, BaseLocationHook } from "./use-location";

// the object returned from `useRouter`
export interface RouterObject {
  readonly hook: BaseLocationHook;
  readonly base: Path;
  readonly ownBase: Path;
  readonly matcher: MatcherFn;
  readonly parent?: RouterObject;
  readonly ssrPath?: Path;
}

// basic options to construct a router
export type RouterOptions = {
  hook?: BaseLocationHook;
  base?: Path;
  matcher?: MatcherFn;
  parent?: RouterObject;
  ssrPath?: Path;
};
