import { Path } from "./location-hook.js";

export function navigate<S = any>(to: Path, options?: { state: S }): void;

export function useHashLocation(options?: {
  ssrPath?: Path;
}): [Path, typeof navigate];
