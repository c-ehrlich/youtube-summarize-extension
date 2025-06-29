/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import { QueryClientProvider } from "@tanstack/solid-query";
import { solidQueryClient } from "./solid-query-provider";
import { ButtonContainer } from "./components/ButtonContainer";



// Initialize the app
const init = () => {
  const container = document.createElement("div");
  container.id = "solid-youtube-summarize-root";
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  render(
    () => (
      <QueryClientProvider client={solidQueryClient}>
        <ButtonContainer />
      </QueryClientProvider>
    ),
    container
  );
};

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
