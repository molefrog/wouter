import {
  BaseLocationHook,
  BaseSearchHook,
  Path,
  SearchString,
} from "./location-hook.js";

type Navigate<S = any> = (
  to: Path,
  options?: { replace?: boolean; state?: S; transition?: boolean }
) => void;

type HookReturnValue<S = unknown> = {
  hook: BaseLocationHook;
  searchHook: BaseSearchHook;
  navigate: Navigate<S>;
  readonly state: S | null;
};
type StubHistory = { history: Path[]; reset: () => void };

export function memoryLocation<S = unknown>(options?: {
  path?: Path;
  searchPath?: SearchString;
  state?: S;
  static?: boolean;
  record?: false;
}): HookReturnValue<S>;
export function memoryLocation<S = unknown>(options?: {
  path?: Path;
  searchPath?: SearchString;
  state?: S;
  static?: boolean;
  record: true;
}): HookReturnValue<S> & StubHistory;
