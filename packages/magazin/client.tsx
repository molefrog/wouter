import { hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { App } from "./App";

hydrateRoot(
  document.body,
  <HelmetProvider>
    <Router>
      <App />
    </Router>
  </HelmetProvider>
);
