import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { SummarizeButton } from "./summarize-button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "../lib/trpc";
import { ThemeProvider } from "../ui/theme/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //   staleTime: Infinity,
      //   refetchOnWindowFocus: false,
      //   refetchOnReconnect: false,
    },
  },
});

type Thumb =
  | {
      type: "regular";
      element: HTMLElement;
    }
  | {
      type: "end-card";
      element: HTMLElement;
    };

const ButtonContainer = () => {
  const [thumbnails, setThumbnails] = useState<Thumb[]>([]);

  useEffect(() => {
    const updateThumbnails = () => {
      const currentThumbnails: Thumb[] = (
        Array.from(document.querySelectorAll("ytd-thumbnail")) as HTMLElement[]
      ).map((t) => ({
        element: t,
        type: "regular",
      }));

      setThumbnails((prev) => {
        const newThumbnails: Thumb[] = currentThumbnails.filter(
          (thumb) =>
            !prev.find((p) => p.element === thumb.element) &&
            !thumb.element.querySelector(".summarize-btn")
        );

        newThumbnails.forEach((thumb) => {
          thumb.element.style.position = "relative";
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

        let title = "";
        let channel = "";
        let videoId = "";

        const gridMedia =
          thumb.element.closest("ytd-rich-grid-media") ??
          thumb.element.closest("ytd-compact-video-renderer");

        // Extract video title
        const titleElement = gridMedia?.querySelector("#video-title");
        title = titleElement?.textContent?.trim() || "";

        // Extract channel name
        const channelElement =
          gridMedia?.querySelector(".yt-formatted-string") ??
          gridMedia?.querySelector(".ytd-channel-name");
        channel = channelElement?.textContent?.trim() || "";

        // Extract video ID from thumbnail link
        const anchor = thumb.element.querySelector(
          "a#thumbnail"
        ) as HTMLAnchorElement;
        const urlParams = new URLSearchParams(anchor?.search || "");
        videoId = urlParams.get("v") || "";

        return (
          <SummarizeButtonPortal
            key={index}
            thumbnailElement={thumb.element}
            videoId={videoId}
            title={title}
            channel={channel}
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
}: {
  thumbnailElement: HTMLElement;
  videoId: string;
  title: string;
  channel: string;
}) => {
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    thumbnailElement.appendChild(container);
    return () => {
      thumbnailElement.removeChild(container);
    };
  }, [thumbnailElement, container]);

  return createPortal(
    <SummarizeButton videoId={videoId} title={title} channel={channel} />,
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
      <ThemeProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ButtonContainer />
          </QueryClientProvider>
        </trpc.Provider>
      </ThemeProvider>
    );

    return () => {
      root.unmount();
      document.body.removeChild(rootContainer);
    };
  }, []);

  return null;
};
