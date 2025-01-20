import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import { SummarizeButton } from "./summarize-button";

export const Init = () => {
  useEffect(() => {
    const addButtonsToThumbnails = () => {
      const thumbnails = document.querySelectorAll(
        "ytd-thumbnail"
      ) as NodeListOf<HTMLElement>;

      thumbnails.forEach((thumb) => {
        if (!thumb.querySelector(".summarize-btn")) {
          thumb.style.position = "relative";
          const buttonContainer = document.createElement("div");
          ReactDOM.createRoot(buttonContainer).render(
            <SummarizeButton thumbnailElement={thumb} />
          );
          thumb.appendChild(buttonContainer);
        }
      });
    };

    // Initial run and interval setup
    addButtonsToThumbnails();

    const interval = setInterval(addButtonsToThumbnails, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
};
