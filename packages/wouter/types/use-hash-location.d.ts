// TODO!
export function useHashLocation(options?: {
  base?: string;
  ssrPath?: string;
}): [string, (to: string, options?: { state: any }) => void];
