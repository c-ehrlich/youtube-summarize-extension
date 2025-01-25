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
        const newThumbnails = currentThumbnails.filter(
          (thumb) =>
            !prev.includes(thumb) && !thumb.querySelector(".summarize-btn")
        );

        newThumbnails.forEach((thumb) => {
          thumb.style.position = "relative";
        });

        return [...prev, ...newThumbnails];
      });
    };

    updateThumbnails();
    const interval = setInterval(updateThumbnails, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {thumbnails.map((thumb, index) => {
        // Find the parent rich-grid-media element
        const gridMedia = thumb.closest("ytd-rich-grid-media");

        // Extract video title
        const titleElement = gridMedia?.querySelector("#video-title");
        const title = titleElement?.textContent?.trim() || "";

        // Extract channel name
        const channelElement = gridMedia?.querySelector(
          "#channel-name yt-formatted-string"
        );
        const channel = channelElement?.textContent?.trim() || "";

        // Extract video description
        const descriptionElement =
          gridMedia?.querySelector("#description-text");
        const description = descriptionElement?.textContent?.trim() || "";

        // Extract video ID from thumbnail link
        const anchor = thumb.querySelector("a#thumbnail") as HTMLAnchorElement;
        const urlParams = new URLSearchParams(anchor?.search || "");
        const videoId = urlParams.get("v") || "";

        return (
          <SummarizeButtonPortal
            key={index}
            thumbnailElement={thumb}
            videoId={videoId}
            title={title}
            channel={channel}
            description={description}
          />
        );
      })}
    </>
  );
};

// Update the portal component to pass the new props
const SummarizeButtonPortal = ({
  thumbnailElement,
  videoId,
  title,
  channel,
  description,
}: {
  thumbnailElement: HTMLElement;
  videoId: string;
  title: string;
  channel: string;
  description: string;
}) => {
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    thumbnailElement.appendChild(container);
    return () => {
      thumbnailElement.removeChild(container);
    };
  }, [thumbnailElement, container]);

  return createPortal(
    <SummarizeButton
      videoId={videoId}
      title={title}
      channel={channel}
      description={description}
    />,
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
