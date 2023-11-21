import { BaseLocationHook, Path } from "./location-hook.js";

type Navigate<S = any> = (
  to: Path,
  options?: { replace?: boolean; state?: S }
) => void;

type HookReturnValue = { hook: BaseLocationHook; navigate: Navigate };
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
