import {
  navigate,
  useBrowserLocation,
  useHistoryState,
  useLocationProperty,
  usePathname,
  useSearch,
} from "wouter/use-browser-location";
import {
  navigate as navigateHash,
  useHashLocation,
} from "wouter/use-hash-location";
import { memoryLocation } from "wouter/memory-location";

// Compile through the package's public exports, rather than source-relative
// imports or path aliases. These functions are never executed.
function browserHooks() {
  navigate(new URL("https://example.com"), { state: { page: 1 } });
  navigateHash("/page", { replace: true });
  useBrowserLocation({ ssrPath: "/" })[0].toUpperCase();
  useHashLocation({ ssrPath: "/" })[0].toUpperCase();
  usePathname({ ssrPath: "/" }).toUpperCase();
  useSearch({ ssrSearch: "q=test" }).toUpperCase();
  useHistoryState<{ page: number }>()?.page.toFixed();
  const literal: "online" = useLocationProperty(() => "online" as const);
  return literal;
}

const memory = memoryLocation({ path: "/", record: true });
memory.navigate("/next");
memory.history[0]?.toUpperCase();
memory.reset();

void browserHooks;
