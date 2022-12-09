import { MatcherFn } from "./matcher";
import { Path, BaseLocationHook } from "./use-location";

// basic options to construct a router
export interface RouterOptions {
  hook: BaseLocationHook;
  base: Path;
  matcher: MatcherFn;
}

// the object returned from `useRouter`, currently just the options
export type RouterObject = RouterOptions;
