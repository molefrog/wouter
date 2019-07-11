import { Path, LocationHook } from "./index";

declare function staticLocationHook(path?: Path): LocationHook;

export = staticLocationHook;
