import { hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import { App } from "./App";

hydrateRoot(
  document.body,
  <Router>
    <App />
  </Router>
);
