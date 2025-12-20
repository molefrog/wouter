import { useRef, useIsomorphicLayoutEffect, useEvent } from "./react-deps.js";

/**
 * Storage key prefix for scroll positions
 */
const SCROLL_STORAGE_KEY = "wouter_scroll_";

/**
 * Gets the scroll position for a given path from sessionStorage
 */
const getScrollPosition = (path) => {
  try {
    const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY + path);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
};

/**
 * Saves the scroll position for a given path to sessionStorage
 */
const saveScrollPosition = (path, position) => {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY + path, String(position));
  } catch {
    // sessionStorage may be unavailable (e.g., private browsing)
  }
};

/**
 * Hook that provides scroll restoration functionality for wouter.
 *
 * Returns an `aroundNav` handler that can be passed to the Router component.
 * This handler automatically:
 * - Saves the current scroll position before navigation
 * - Restores scroll position when navigating back/forward (popstate)
 * - Scrolls to top when navigating to a new page (push navigation)
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.scrollToTop=true] - Whether to scroll to top on new navigation
 * @param {(path: string) => string} [options.getKey] - Custom function to generate storage key from path
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
 * // Combine with view transitions
 * import { Router } from "wouter";
 * import { useScrollRestoration } from "wouter/use-scroll-restoration";
 *
 * function App() {
 *   const scrollRestoration = useScrollRestoration();
 *
 *   const aroundNav = (navigate, to, options) => {
 *     // First handle scroll restoration
 *     scrollRestoration(navigate, to, options, () => {
 *       // Then optionally handle view transitions
 *       if (options?.transition && document.startViewTransition) {
 *         document.startViewTransition(() => navigate(to, options));
 *       } else {
 *         navigate(to, options);
 *       }
 *     });
 *   };
 *
 *   return (
 *     <Router aroundNav={aroundNav}>
 *       <Routes />
 *     </Router>
 *   );
 * }
 */
export const useScrollRestoration = ({
  scrollToTop = true,
  getKey = (path) => path,
} = {}) => {
  // Track whether navigation is from popstate (back/forward)
  const isPopstateRef = useRef(false);
  // Store the target path for scroll restoration after navigation
  const targetPathRef = useRef(null);

  // Listen for popstate events to detect back/forward navigation
  useIsomorphicLayoutEffect(() => {
    const handlePopstate = () => {
      isPopstateRef.current = true;
    };

    addEventListener("popstate", handlePopstate);
    return () => removeEventListener("popstate", handlePopstate);
  }, []);

  // aroundNav handler that manages scroll restoration
  // useEvent ensures stable function reference across re-renders
  const scrollRestoration = useEvent((navigate, to, options) => {
    const currentPath = location.pathname;
    const key = getKey(currentPath);

    // Save current scroll position before navigating
    saveScrollPosition(key, window.scrollY);

    // Track the target path for restoration
    targetPathRef.current = getKey(to);

    // Check if this is a popstate navigation (back/forward)
    const isPop = isPopstateRef.current;
    isPopstateRef.current = false;

    // Perform the navigation
    navigate(to, options);

    // Handle scroll after navigation
    // Using requestAnimationFrame ensures the DOM has updated
    requestAnimationFrame(() => {
      // Don't scroll if explicitly disabled via options
      if (options?.skipScroll) return;

      if (isPop) {
        // Restore scroll position for back/forward navigation
        const targetKey = targetPathRef.current;
        const savedPosition = getScrollPosition(targetKey);

        if (savedPosition !== null) {
          window.scrollTo(0, savedPosition);
        }
      } else if (scrollToTop) {
        // Scroll to top for new navigation
        window.scrollTo(0, 0);
      }
    });
  });

  return scrollRestoration;
};

/**
 * Creates a scroll restoration aroundNav handler without using hooks.
 * Useful for cases where you need scroll restoration outside of React components.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.scrollToTop=true] - Whether to scroll to top on new navigation
 * @param {(path: string) => string} [options.getKey] - Custom function to generate storage key from path
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
export const createScrollRestoration = ({
  scrollToTop = true,
  getKey = (path) => path,
} = {}) => {
  let isPopstate = false;
  let targetPath = null;

  // Set up popstate listener immediately
  if (typeof window !== "undefined") {
    addEventListener("popstate", () => {
      isPopstate = true;
    });
  }

  return (navigate, to, options) => {
    if (typeof window === "undefined") {
      // SSR - just navigate without scroll handling
      navigate(to, options);
      return;
    }

    const currentPath = location.pathname;
    const key = getKey(currentPath);

    // Save current scroll position before navigating
    saveScrollPosition(key, window.scrollY);

    // Track the target path for restoration
    targetPath = getKey(to);

    // Check if this is a popstate navigation (back/forward)
    const isPop = isPopstate;
    isPopstate = false;

    // Perform the navigation
    navigate(to, options);

    // Handle scroll after navigation
    requestAnimationFrame(() => {
      // Don't scroll if explicitly disabled via options
      if (options?.skipScroll) return;

      if (isPop) {
        // Restore scroll position for back/forward navigation
        const savedPosition = getScrollPosition(targetPath);

        if (savedPosition !== null) {
          window.scrollTo(0, savedPosition);
        }
      } else if (scrollToTop) {
        // Scroll to top for new navigation
        window.scrollTo(0, 0);
      }
    });
  };
};

/**
 * Utility to compose multiple aroundNav handlers.
 *
 * @param {...AroundNavHandler} handlers - The handlers to compose
 * @returns {AroundNavHandler} A single composed handler
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
export const composeAroundNav =
  (...handlers) =>
  (navigate, to, options) => {
    if (handlers.length === 0) {
      navigate(to, options);
      return;
    }

    // Build the chain of handlers
    // Each handler wraps the next one
    const chain = handlers.reduceRight(
      (next, handler) => (to2, options2) => handler(next, to2, options2),
      navigate
    );

    chain(to, options);
  };
