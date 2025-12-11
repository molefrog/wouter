import { hydrateRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Router, type NavigateOptions, type AroundNavHandler } from "wouter";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { App } from "./App";

// Enable view transitions for navigation
const aroundNav: AroundNavHandler = (navigate, to, options) => {
  // Feature detection for browsers that don't support View Transitions
  if (!document.startViewTransition) {
    navigate(to, options);
    return;
  }

  // Only use view transitions if explicitly requested
  if (options?.transition) {
    document.startViewTransition(() => {
      flushSync(() => {
        navigate(to, options);
      });
    });
  } else {
    navigate(to, options);
  }
};

hydrateRoot(
  document.body,
  <HelmetProvider>
    <Router aroundNav={aroundNav}>
      <App />
    </Router>
  </HelmetProvider>
);
