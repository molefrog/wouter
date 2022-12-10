import { MatcherFn } from "./matcher";
import { Path, BaseLocationHook } from "./use-location";

// the object returned from `useRouter`, currently just the options
export interface RouterObject {
  hook: BaseLocationHook;
  base: Path;
  matcher: MatcherFn;
  parent?: RouterObject;
}

// basic options to construct a router
export type RouterOptions = Partial<RouterObject>;
