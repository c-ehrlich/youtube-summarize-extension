import React from "react";
import ReactDOM from "react-dom/client";
import { Popup } from "./popup/popup";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <p>
      For now there is no way to configure a local api key. Please spin up a
      copy of the server!
    </p>
    {/* <Popup /> */}
  </React.StrictMode>
);
