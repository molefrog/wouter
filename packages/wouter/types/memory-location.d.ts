import {
  BaseLocationHook,
  BaseSearchHook,
  Path,
  SearchString,
} from "./location-hook.js";

type Navigate = (
  to: Path,
  options?: { replace?: boolean; state?: any; transition?: boolean }
) => void;

type StateHook = () => any;

type StateGetter = {
  readonly current: any;
};

type HookReturnValue = {
  hook: BaseLocationHook;
  searchHook: BaseSearchHook;
  stateHook: StateHook;
  navigate: Navigate;
  state: StateGetter;
};
type StubHistory = { history: Path[]; reset: () => void };

export function memoryLocation(options?: {
  path?: Path;
  searchPath?: SearchString;
  static?: boolean;
  record?: false;
  state?: any;
}): HookReturnValue;
export function memoryLocation(options?: {
  path?: Path;
  searchPath?: SearchString;
  static?: boolean;
  record: true;
  state?: any;
}): HookReturnValue & StubHistory;
