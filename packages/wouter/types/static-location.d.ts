import { Path, LocationHook } from "./use-location";

interface StaticLocationHookOptions {
  record?: boolean;
}

interface StaticLocationHook extends LocationHook {
  history: Readonly<Path[]>;
}

declare function staticLocationHook(
  path?: Path,
  options?: StaticLocationHookOptions
): StaticLocationHook;

export default staticLocationHook;
