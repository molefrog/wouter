import type { Path, SearchString } from "./location-hook.js";
import type { NavigateOptions } from "./router.js";

type Navigate<S> = (to: Path, options?: NavigateOptions<S>) => void;
type SearchHook = () => SearchString;

type HookReturnValue<S = unknown> = {
  hook: {
    (): [Path, Navigate<S>];
    searchHook: SearchHook;
  };
  searchHook: SearchHook;
  navigate: Navigate<S>;
  readonly state: S | null;
};
type StubHistory = { history: Path[]; reset: () => void };

type MemoryLocationOptions<S> = {
  path?: Path;
  searchPath?: SearchString;
  state?: S;
  static?: boolean;
};

export function memoryLocation<S = unknown>(
  options?: MemoryLocationOptions<S> & { record?: false }
): HookReturnValue<S>;
export function memoryLocation<S = unknown>(
  options: MemoryLocationOptions<S> & { record: true }
): HookReturnValue<S> & StubHistory;
export function memoryLocation<S = unknown>(
  options: MemoryLocationOptions<S> & { record?: boolean }
): HookReturnValue<S> & Partial<StubHistory>;
