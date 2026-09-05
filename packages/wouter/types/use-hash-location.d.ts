import type { Path } from "./location-hook.js";
import type { NavigateOptions } from "./router.js";

export function navigate<S = any>(to: Path, options?: NavigateOptions<S>): void;

export type HashLocationHook = {
  (options?: { ssrPath?: Path }): [Path, typeof navigate];
  hrefs: (href: Path) => Path;
};

export const useHashLocation: HashLocationHook;
