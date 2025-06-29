/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import "./index.css";

function MainSolid() {
  return (
    <p>
      For now there is no way to configure a local api key. Please spin up a
      copy of the server!
    </p>
  );
}

render(() => <MainSolid />, document.getElementById("root")!);
