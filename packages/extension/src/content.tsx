import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Init } from "./content/init";

const root = document.createElement("div");
root.id = "crx-root";
document.body.appendChild(root);

// Update the main render to include the YouTubeSummarizer
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Init />
  </React.StrictMode>
);
