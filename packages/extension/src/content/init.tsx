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
    }
  | {
      type: "metadata";
      element: HTMLElement;
    };

const ButtonContainer = () => {
  const [thumbnails, setThumbnails] = useState<Thumb[]>([]);

  useEffect(() => {
    // Process new thumbnails that don't already have our button
    const processThumbnails = (newElements: HTMLElement[]) => {
      // First, remove any existing buttons from the elements we're about to process
      newElements.forEach((el) => {
        const existingBtn = el.querySelector(".summarize-btn");
        if (existingBtn) {
          existingBtn.remove();
        }
      });

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

      const metadataThumbnails: Thumb[] = newElements
        .filter((el) => {
          // Only select metadata lines that have a valid video-title link in their parent meta div
          if (!el.matches("#metadata-line")) return false;
          const metaDiv = el.closest("#meta");
          const titleAnchor = metaDiv?.querySelector("a#video-title");
          return !!titleAnchor;
        })
        .map((t) => ({
          element: t,
          type: "metadata" as const,
        }));

      const currentThumbnails = [
        ...regularThumbnails,
        ...endCardThumbnails,
        ...metadataThumbnails,
      ];

      setThumbnails((prev) => {
        // Remove any thumbnails that we're about to replace
        const filteredPrev = prev.filter(
          (p) => !currentThumbnails.some((c) => c.element === p.element)
        );

        return [...filteredPrev, ...currentThumbnails];
      });
    };

    // Add function to handle media container changes
    const processMediaContainer = () => {
      const mediaContainer = document.querySelector(
        "#media-container-link"
      ) as HTMLAnchorElement;
      if (!mediaContainer) return;

      const videoPlayer = document.querySelector(
        ".html5-video-player"
      ) as HTMLElement;
      if (!videoPlayer || videoPlayer.querySelector(".summarize-btn")) return;

      const href = mediaContainer.getAttribute("href") || "";
      const videoIdMatch = href.match(/\/watch\?v=([^&?]+)/);
      const videoId = videoIdMatch?.[1] || "";

      if (videoId) {
        setThumbnails((prev) => {
          if (prev.some((thumb) => thumb.element === videoPlayer)) return prev;

          return [
            ...prev,
            {
              type: "regular",
              element: videoPlayer,
            },
          ];
        });
      }
    };

    // Initial scan for existing thumbnails
    const initialThumbnails = [
      ...Array.from(document.querySelectorAll("ytd-thumbnail")),
      ...Array.from(document.querySelectorAll(".ytp-videowall-still")),
      ...Array.from(document.querySelectorAll("#metadata-line")),
    ] as HTMLElement[];

    processThumbnails(initialThumbnails);
    processMediaContainer(); // Initial check for media container

    // Set up mutation observer
    const observer = new MutationObserver((mutations) => {
      const newElements: HTMLElement[] = [];

      mutations.forEach((mutation) => {
        // Check for media container link href changes
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "href" &&
          mutation.target instanceof HTMLElement &&
          mutation.target.id === "media-container-link"
        ) {
          processMediaContainer();
          return;
        }

        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Direct match
              if (
                node.matches("ytd-thumbnail") ||
                node.matches(".ytp-videowall-still") ||
                node.matches("#metadata-line")
              ) {
                newElements.push(node);
              }
              // Check children
              node
                .querySelectorAll(
                  "ytd-thumbnail, .ytp-videowall-still, #metadata-line"
                )
                .forEach((el) => {
                  newElements.push(el as HTMLElement);
                });
            }
          });

          // Check for modifications to existing containers
          if (mutation.target instanceof HTMLElement) {
            mutation.target
              .querySelectorAll(
                "ytd-thumbnail, .ytp-videowall-still, #metadata-line"
              )
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

    // Update observer configuration to include attributes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
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

        if (thumb.type === "metadata") {
          console.log("thumb", thumb);
          // For metadata, walk up to find #meta and then find video-title link
          const metaDiv = thumb.element.closest("#meta");
          console.log("tktk metaDiv", metaDiv);
          const titleAnchor = metaDiv?.querySelector(
            "a#video-title"
          ) as HTMLAnchorElement;
          console.log("tktk titleAnchor", titleAnchor);

          if (titleAnchor) {
            title = titleAnchor.textContent?.trim() || "";
            const urlParams = new URLSearchParams(titleAnchor.search);
            videoId = urlParams.get("v") || "";

            // Find channel name
            const channelElement =
              metaDiv?.querySelector(".yt-formatted-string") ??
              metaDiv?.querySelector(".ytd-channel-name");
            channel = channelElement?.textContent?.trim() || "";
          }
        } else if (thumb.type === "regular") {
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
          const anchor = gridMedia?.querySelector(
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
  type: "regular" | "end-card" | "metadata";
}) => {
  const [container] = useState(() => document.createElement("div"));

  useEffect(() => {
    if (type === "end-card") {
      // For end cards, position the button in the top-right corner
      container.style.position = "absolute";
      container.style.bottom = "0px";
      container.style.left = "0px";
      container.style.zIndex = "99999";
    } else if (type === "metadata") {
      // For metadata line, just add some margin and display inline
      container.style.marginLeft = "8px";
      container.style.display = "inline-block";
    } else if (type === "regular") {
      // For regular thumbnails, keep the relative positioning
      container.style.position = "relative";
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
      <SummarizeButton
        videoId={videoId}
        title={title}
        channel={channel}
        type={type}
      />
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
