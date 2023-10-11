import { Path } from "./use-browser-location";

export function navigate<S = any>(to: Path, options?: { state: S }): void;

export function useHashLocation(options?: {
  base?: Path;
  ssrPath?: Path;
}): [Path, typeof navigate];
