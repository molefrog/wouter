import { BaseLocationHook, navigate, Path } from "./use-browser-location";

type HookReturnValue = { hook: BaseLocationHook; navigate: typeof navigate };
type StubHistory = { history: Path[]; reset: () => void };

export function memoryLocation(options?: {
  path?: Path;
  static?: boolean;
  record?: false;
}): HookReturnValue;
export function memoryLocation(options?: {
  path?: Path;
  static?: boolean;
  record: true;
}): HookReturnValue & StubHistory;
