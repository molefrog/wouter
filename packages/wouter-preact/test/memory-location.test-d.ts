import { memoryLocation } from "../types/memory-location.js";
import { useLocation } from "../types/index.js";
import { useLocationProperty } from "../types/use-browser-location.js";
import { useHashLocation } from "../types/use-hash-location.js";

const memory = memoryLocation({ searchPath: "?tab=1" });
const search: string = memory.searchHook();
const recorded = memoryLocation({ searchPath: search, record: true });
const recordedSearch: string = recorded.searchHook();
recorded.navigate("/next?" + recordedSearch);

// @ts-expect-error - searchPath is a string, just like in the React package
memoryLocation({ searchPath: 42 });
// @ts-expect-error - searchHook returns a string
const invalid: number = memory.searchHook();

const typed = memoryLocation({ state: { count: 0 } });
const [, navigate] = typed.hook();
navigate("/next", { state: { count: 1 } });
const [, navigateThroughRouter] = useLocation<typeof typed.hook>();
navigateThroughRouter("/next", { state: { count: 2 } });
const inheritedSearch: string = typed.hook.searchHook();

// @ts-expect-error - the memory hook preserves the inferred state type
navigate("/next", { state: "wrong" });
// @ts-expect-error - useLocation preserves the inferred state type
navigateThroughRouter("/next", { state: { count: "wrong" } });

const dynamic = memoryLocation<{ count: number }>({
  record: Math.random() > 0.5,
});
const maybeHistory: string[] | undefined = dynamic.history;
dynamic.reset?.();
dynamic.navigate("/next", { state: { count: 1 } });
// @ts-expect-error - recording may be disabled
dynamic.reset();

const cachedSnapshot = { count: 1 };
const snapshot: { count: number } = useLocationProperty(() => cachedSnapshot);
const hashHref: string = useHashLocation.hrefs("/next");
// @ts-expect-error - hrefs formats string paths
useHashLocation.hrefs(42);
