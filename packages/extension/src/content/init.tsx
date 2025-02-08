import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { SummarizeButton } from "./summarize-button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../ui/theme/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
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
    // Process new thumbnails that don't already have our button
    const processThumbnails = (newElements: HTMLElement[]) => {
      const regularThumbnails: Thumb[] = newElements
        .filter((el) => el.matches("ytd-thumbnail"))
        .map((t) => ({
          element: t,
          type: "regular" as const,
        }));

      const endCardThumbnails: Thumb[] = newElements
        .filter((el) => el.matches(".ytp-videowall-still"))
        .map((t) => ({
          element: t,
          type: "end-card" as const,
        }));

      const currentThumbnails = [...regularThumbnails, ...endCardThumbnails];

      setThumbnails((prev) => {
        const newThumbnails: Thumb[] = currentThumbnails.filter(
          (thumb) =>
            !prev.find((p) => p.element === thumb.element) &&
            !thumb.element.querySelector(".summarize-btn")
        );

        // Only set position relative for regular thumbnails
        newThumbnails.forEach((thumb) => {
          if (thumb.type === "regular") {
            thumb.element.style.position = "relative";
          }
        });

        return [...prev, ...newThumbnails];
      });
    };

    // Initial scan for existing thumbnails
    const initialThumbnails = [
      ...Array.from(document.querySelectorAll("ytd-thumbnail")),
      ...Array.from(document.querySelectorAll(".ytp-videowall-still")),
    ] as HTMLElement[];

    processThumbnails(initialThumbnails);

    // Set up mutation observer
    const observer = new MutationObserver((mutations) => {
      const newElements: HTMLElement[] = [];

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Check added nodes
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Direct match
              if (
                node.matches("ytd-thumbnail") ||
                node.matches(".ytp-videowall-still")
              ) {
                newElements.push(node);
              }
              // Check children
              node
                .querySelectorAll("ytd-thumbnail, .ytp-videowall-still")
                .forEach((el) => {
                  newElements.push(el as HTMLElement);
                });
            }
          });

          // Check for modifications to existing containers that might add thumbnails
          if (mutation.target instanceof HTMLElement) {
            mutation.target
              .querySelectorAll("ytd-thumbnail, .ytp-videowall-still")
              .forEach((el) => {
                if (!el.querySelector(".summarize-btn")) {
                  newElements.push(el as HTMLElement);
                }
              });
          }
        }
      });

      if (newElements.length > 0) {
        processThumbnails(newElements);
      }
    });

    // Start observing with configuration
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {thumbnails.map((thumb, index) => {
        let title = "";
        let channel = "";
        let videoId = "";

        if (thumb.type === "regular") {
          // Handle regular thumbnail data extraction
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
        } else {
          // Handle end card thumbnail data extraction
          const titleElement = thumb.element.querySelector(
            ".ytp-videowall-still-info-title"
          );
          title = titleElement?.textContent?.trim() || "";

          const authorElement = thumb.element.querySelector(
            ".ytp-videowall-still-info-author"
          );
          channel = authorElement?.textContent?.split("•")[0]?.trim() || "";

          // Extract video ID from href
          const href = thumb.element.getAttribute("href") || "";
          const videoIdMatch = href.match(
            /(?:\/watch\?v=|youtu\.be\/)([^&?]+)/
          );
          videoId = videoIdMatch?.[1] || "";
        }

        return (
          <SummarizeButtonPortal
            key={index}
            thumbnailElement={thumb.element}
            videoId={videoId}
            title={title}
            channel={channel}
            type={thumb.type}
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
  type,
}: {
  thumbnailElement: HTMLElement;
  videoId: string;
  title: string;
  channel: string;
  type: "regular" | "end-card";
}) => {
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    if (type === "end-card") {
      // For end cards, position the button in the top-right corner
      container.style.position = "absolute";
      container.style.bottom = "0px";
      container.style.left = "0px";
      container.style.zIndex = "9990";
    }
  }, [container, type]);

  // Separate effect for DOM mounting/unmounting
  useEffect(() => {
    thumbnailElement.appendChild(container);
    return () => {
      thumbnailElement.removeChild(container);
    };
  }, [thumbnailElement, container]);

  const handleWrapperClick = (e: React.MouseEvent) => {
    if (type === "end-card") {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return createPortal(
    <div
      onClick={handleWrapperClick}
      onMouseDown={handleWrapperClick}
      onMouseUp={handleWrapperClick}
    >
      <SummarizeButton videoId={videoId} title={title} channel={channel} />
    </div>,
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
        <QueryClientProvider client={queryClient}>
          <ButtonContainer />
        </QueryClientProvider>
      </ThemeProvider>
    );

    return () => {
      root.unmount();
      document.body.removeChild(rootContainer);
    };
  }, []);

  return null;
};
