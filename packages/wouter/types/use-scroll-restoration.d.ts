import { AroundNavHandler, NavigateOptions } from "./router.js";
import { Path } from "./location-hook.js";

/**
 * Options for configuring scroll restoration behavior
 */
export interface ScrollRestorationOptions {
  /**
   * Whether to scroll to top on new navigation (non-popstate).
   * @default true
   */
  scrollToTop?: boolean;

  /**
   * Custom function to generate the storage key from a path.
   * Useful for ignoring query parameters or normalizing paths.
   * @default (path) => path
   */
  getKey?: (path: Path) => string;
}

/**
 * Extended navigation options that include scroll control
 */
export interface ScrollNavigateOptions extends NavigateOptions {
  /**
   * Skip scroll handling for this navigation.
   * When true, neither scroll-to-top nor scroll restoration will occur.
   */
  skipScroll?: boolean;
}

/**
 * Hook that provides scroll restoration functionality for wouter.
 *
 * Returns an `aroundNav` handler that can be passed to the Router component.
 * This handler automatically:
 * - Saves the current scroll position before navigation
 * - Restores scroll position when navigating back/forward (popstate)
 * - Scrolls to top when navigating to a new page (push navigation)
 *
 * @example
 * import { Router } from "wouter";
 * import { useScrollRestoration } from "wouter/use-scroll-restoration";
 *
 * function App() {
 *   const scrollRestoration = useScrollRestoration();
 *
 *   return (
 *     <Router aroundNav={scrollRestoration}>
 *       <Routes />
 *     </Router>
 *   );
 * }
 *
 * @example
 * // With custom key function to ignore query params
 * const scrollRestoration = useScrollRestoration({
 *   getKey: (path) => path.split('?')[0]
 * });
 */
export function useScrollRestoration(
  options?: ScrollRestorationOptions
): AroundNavHandler;

/**
 * Creates a scroll restoration aroundNav handler without using hooks.
 * Useful for cases where you need scroll restoration outside of React components.
 *
 * @example
 * import { Router } from "wouter";
 * import { createScrollRestoration } from "wouter/use-scroll-restoration";
 *
 * const scrollRestoration = createScrollRestoration();
 *
 * function App() {
 *   return (
 *     <Router aroundNav={scrollRestoration}>
 *       <Routes />
 *     </Router>
 *   );
 * }
 */
export function createScrollRestoration(
  options?: ScrollRestorationOptions
): AroundNavHandler;

/**
 * Utility to compose multiple aroundNav handlers.
 *
 * Handlers are executed in order, with each handler receiving
 * a wrapped navigate function that will call the next handler.
 *
 * @example
 * import { Router } from "wouter";
 * import { useScrollRestoration, composeAroundNav } from "wouter/use-scroll-restoration";
 *
 * function App() {
 *   const scrollRestoration = useScrollRestoration();
 *
 *   const viewTransitions = (navigate, to, options) => {
 *     if (options?.transition && document.startViewTransition) {
 *       document.startViewTransition(() => navigate(to, options));
 *     } else {
 *       navigate(to, options);
 *     }
 *   };
 *
 *   // Scroll restoration runs first, then view transitions
 *   const aroundNav = composeAroundNav(scrollRestoration, viewTransitions);
 *
 *   return (
 *     <Router aroundNav={aroundNav}>
 *       <Routes />
 *     </Router>
 *   );
 * }
 */
export function composeAroundNav(
  ...handlers: AroundNavHandler[]
): AroundNavHandler;
