import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { SummarizeButton } from "./summarize-button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const ButtonContainer = () => {
  const [thumbnails, setThumbnails] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const updateThumbnails = () => {
      const currentThumbnails = Array.from(
        document.querySelectorAll("ytd-thumbnail")
      ) as HTMLElement[];

      setThumbnails((prev) => {
        // Only add thumbnails that we haven't seen before
        const newThumbnails = currentThumbnails.filter(
          (thumb) =>
            !prev.includes(thumb) && !thumb.querySelector(".summarize-btn")
        );

        // Set position relative on new thumbnails
        newThumbnails.forEach((thumb) => {
          thumb.style.position = "relative";
        });

        return [...prev, ...newThumbnails];
      });
    };

    // Initial run and interval setup
    updateThumbnails();
    const interval = setInterval(updateThumbnails, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {thumbnails.map((thumb, index) => (
        <SummarizeButtonPortal key={index} thumbnailElement={thumb} />
      ))}
    </>
  );
};

// This component handles creating a portal for each button
const SummarizeButtonPortal = ({
  thumbnailElement,
}: {
  thumbnailElement: HTMLElement;
}) => {
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    thumbnailElement.appendChild(container);
    return () => {
      thumbnailElement.removeChild(container);
    };
  }, [thumbnailElement, container]);

  return createPortal(
    <SummarizeButton thumbnailElement={thumbnailElement} />,
    container
  );
};

export const Init = () => {
  useEffect(() => {
    // Create a single root container for our app
    const rootContainer = document.createElement("div");
    document.body.appendChild(rootContainer);

    const root = ReactDOM.createRoot(rootContainer);
    root.render(
      <QueryClientProvider client={queryClient}>
        <ButtonContainer />
      </QueryClientProvider>
    );

    return () => {
      root.unmount();
      document.body.removeChild(rootContainer);
    };
  }, []);

  return null;
};
