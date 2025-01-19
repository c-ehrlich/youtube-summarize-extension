import React from "react";
import ReactDOM from "react-dom";

function App() {
  console.log("tktk app");
  return <p>appyyyy</p>;
}

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  root
);
