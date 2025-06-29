import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Use new architecture for Phase 1 testing
import { InitNew } from "./content/init-new";

const root = document.createElement("div");
root.id = "crx-root";
document.body.appendChild(root);

// Update the main render to include the new YouTube architecture
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <InitNew />
  </React.StrictMode>
);
