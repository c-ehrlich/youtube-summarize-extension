/** @jsxImportSource solid-js */
/**
 * Solid.js version of init-new.tsx
 * Replaces React with Solid.js while keeping all functionality
 */

import { render } from "solid-js/web";
import { createSignal, onMount, onCleanup, For } from "solid-js";

interface VideoInfo {
  videoId: string;
  title: string;
  channel: string;
  url: string;
}

interface ThumbnailData {
  id: string;
  element: HTMLElement;
  videoInfo: VideoInfo;
  type:
    | "regular"
    | "end-card"
    | "metadata"
    | "player"
    | "shorts"
    | "live"
    | "premiere";
  containerType:
    | "grid"
    | "list"
    | "sidebar"
    | "endscreen"
    | "player"
    | "unknown";
  videoType:
    | "standard"
    | "shorts"
    | "live"
    | "premiere"
    | "upcoming"
    | "unknown";
  context:
    | "home"
    | "search"
    | "watch"
    | "channel"
    | "subscriptions"
    | "trending"
    | "shorts-feed"
    | "unknown";
}

// Simple Solid.js button component (replacing React SummarizeButton)
function SolidSummarizeButton(props: {
  videoId: string;
  title: string;
  channel: string;
  type: ThumbnailData["type"];
}) {
  const handleClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    // For now, show alert - we can implement actual summarization later
    alert(
      `Summarize: ${props.title}\nChannel: ${props.channel}\nVideo ID: ${props.videoId}`
    );
  };

  const buttonStyles = () => {
    const base = {
      background: "#ff0000",
      color: "white",
      border: "none",
      padding: "6px 12px",
      "border-radius": "4px",
      "font-size": "12px",
      "font-weight": "bold",
      cursor: "pointer",
      "z-index": "1000",
    };

    if (props.type === "metadata") {
      return base; // No special positioning for metadata
    }

    return base;
  };

  return (
    <button
      class="summarize-btn solid-summarize-btn"
      style={buttonStyles()}
      onClick={handleClick}
    >
      Summarize (Solid)
    </button>
  );
}

// Portal component (replacing React createPortal)
function SolidButtonPortal(props: {
  thumbnailElement: HTMLElement;
  videoId: string;
  title: string;
  channel: string;
  type: ThumbnailData["type"];
}) {
  let containerRef!: HTMLDivElement;

  onMount(() => {
    // Apply positioning styles based on thumbnail type
    const containerStyles = getButtonPosition(props.type);
    Object.assign(containerRef.style, containerStyles);

    containerRef.classList.add("yt-summarize-container");
    props.thumbnailElement.appendChild(containerRef);

    console.log("[SolidButtonPortal] Button injected for:", {
      videoId: props.videoId,
      title: props.title,
      type: props.type,
    });
  });

  onCleanup(() => {
    try {
      if (containerRef && containerRef.parentNode) {
        containerRef.parentNode.removeChild(containerRef);
      }
    } catch (error) {
      console.error("[SolidButtonPortal] Error removing container:", error);
    }
  });

  const handleWrapperClick = (e: Event) => {
    if (props.type === "end-card") {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef!}
      onClick={handleWrapperClick}
      onMouseDown={handleWrapperClick}
      onMouseUp={handleWrapperClick}
    >
      <SolidSummarizeButton
        videoId={props.videoId}
        title={props.title}
        channel={props.channel}
        type={props.type}
      />
    </div>
  );
}

// Main container component
function SolidButtonContainer() {
  const [thumbnails, setThumbnails] = createSignal<ThumbnailData[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);

  let debounceTimer: number | null = null;
  let mutationObserver: MutationObserver | null = null;
  const processed = new Set<HTMLElement>();

  // YouTube detection logic (enhanced from original)
  const detectThumbnails = (): ThumbnailData[] => {
    const found: ThumbnailData[] = [];
    const context = getCurrentContext();

    try {
      // Detect regular thumbnails
      const regularThumbnails = document.querySelectorAll("ytd-thumbnail");
      regularThumbnails.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;

        // Check if already has a button
        if (hasExistingButton(htmlElement)) return;

        const videoInfo = extractVideoInfoFromRegular(htmlElement);
        if (videoInfo) {
          found.push({
            id: `regular-${videoInfo.videoId}-${index}`,
            element: htmlElement,
            videoInfo,
            type: getVideoType(htmlElement),
            containerType: "grid",
            videoType: "standard",
            context,
          });
          processed.add(htmlElement);
        }
      });

      // Detect end card thumbnails
      const endCardThumbnails = document.querySelectorAll(
        ".ytp-videowall-still"
      );
      endCardThumbnails.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;

        if (hasExistingButton(htmlElement)) return;

        const videoInfo = extractVideoInfoFromEndCard(htmlElement);
        if (videoInfo) {
          found.push({
            id: `endcard-${videoInfo.videoId}-${index}`,
            element: htmlElement,
            videoInfo,
            type: "end-card",
            containerType: "endscreen",
            videoType: "standard",
            context,
          });
          processed.add(htmlElement);
        }
      });

      // Detect metadata thumbnails
      const metadataElements = document.querySelectorAll("#metadata-line");
      metadataElements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;

        const metaDiv = htmlElement.closest("#meta");
        const titleAnchor = metaDiv?.querySelector("a#video-title");

        if (titleAnchor && !hasExistingButton(htmlElement)) {
          const videoInfo = extractVideoInfoFromMetadata(htmlElement);
          if (videoInfo) {
            found.push({
              id: `metadata-${videoInfo.videoId}-${index}`,
              element: htmlElement,
              videoInfo,
              type: "metadata",
              containerType: "list",
              videoType: "standard",
              context,
            });
            processed.add(htmlElement);
          }
        }
      });
    } catch (error) {
      console.error(
        "[SolidButtonContainer] Error detecting thumbnails:",
        error
      );
    }

    return found;
  };

  const processPage = () => {
    if (isProcessing()) return;
    setIsProcessing(true);

    try {
      console.log("[SolidButtonContainer] Processing page...");
      const detected = detectThumbnails();

      if (detected.length > 0) {
        console.log(
          `[SolidButtonContainer] Found ${detected.length} new thumbnails`
        );
        setThumbnails((prev) => [...prev, ...detected]);
      }
    } catch (error) {
      console.error("[SolidButtonContainer] Error processing page:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const debounceProcessPage = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      processPage();
      debounceTimer = null;
    }, 500); // Conservative debounce
  };

  onMount(() => {
    console.log("[SolidButtonContainer] Initializing...");

    // Initial processing with delay
    setTimeout(() => {
      processPage();
    }, 1000);

    // Set up mutation observer
    mutationObserver = new MutationObserver((mutations) => {
      const hasSignificantChanges = mutations.some(
        (mutation) =>
          mutation.type === "childList" && mutation.addedNodes.length > 0
      );

      if (hasSignificantChanges) {
        debounceProcessPage();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Listen for YouTube navigation
    const handleNavigation = () => {
      console.log("[SolidButtonContainer] Navigation detected");
      // Clear existing thumbnails on navigation
      setThumbnails([]);
      setTimeout(() => processPage(), 1000);
    };

    window.addEventListener("yt-navigate-finish", handleNavigation);

    onCleanup(() => {
      console.log("[SolidButtonContainer] Cleaning up...");
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.removeEventListener("yt-navigate-finish", handleNavigation);
    });
  });

  console.log(
    "[SolidButtonContainer] Rendering with thumbnails:",
    thumbnails().length
  );

  return (
    <For each={thumbnails()}>
      {(thumbnail) => (
        <SolidButtonPortal
          thumbnailElement={thumbnail.element}
          videoId={thumbnail.videoInfo.videoId}
          title={thumbnail.videoInfo.title}
          channel={thumbnail.videoInfo.channel}
          type={thumbnail.type}
        />
      )}
    </For>
  );
}

// Utility functions (ported from youtube-dom-utils)
function getCurrentContext(): ThumbnailData["context"] {
  const pathname = window.location.pathname;

  if (pathname === "/" || pathname.startsWith("/feed/home")) return "home";
  if (pathname.startsWith("/results")) return "search";
  if (pathname.startsWith("/watch")) return "watch";
  if (
    pathname.startsWith("/channel") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/@")
  )
    return "channel";
  if (pathname.startsWith("/feed/subscriptions")) return "subscriptions";
  if (pathname.startsWith("/feed/trending")) return "trending";
  if (pathname.startsWith("/shorts")) return "shorts-feed";

  return "unknown";
}

function hasExistingButton(element: HTMLElement): boolean {
  return !!element.querySelector(".summarize-btn, .yt-summarize-container");
}

function getButtonPosition(
  type: ThumbnailData["type"]
): Partial<CSSStyleDeclaration> {
  switch (type) {
    case "end-card":
      return {
        position: "absolute",
        bottom: "0px",
        left: "0px",
        zIndex: "1001",
      };
    case "metadata":
      return {
        marginLeft: "8px",
        display: "inline-block",
      };
    default:
      return {
        position: "absolute",
        bottom: "8px",
        left: "8px",
        zIndex: "1001",
      };
  }
}

function extractVideoInfoFromRegular(element: HTMLElement): VideoInfo | null {
  try {
    const container = element.closest(
      "ytd-rich-grid-media, ytd-compact-video-renderer, ytd-video-renderer"
    );
    if (!container) return null;

    const titleElement = container.querySelector("#video-title");
    const title = titleElement?.textContent?.trim() || "";

    const channelElement = container.querySelector(
      ".yt-formatted-string, #channel-name"
    );
    const channel = channelElement?.textContent?.trim() || "";

    const anchor = container.querySelector("a#thumbnail") as HTMLAnchorElement;
    if (!anchor) return null;

    const urlParams = new URLSearchParams(anchor.search || "");
    const videoId = urlParams.get("v") || "";

    if (!videoId) return null;

    return {
      videoId,
      title,
      channel,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    console.error(
      "[SolidButtonContainer] Error extracting regular video info:",
      error
    );
    return null;
  }
}

function extractVideoInfoFromEndCard(element: HTMLElement): VideoInfo | null {
  try {
    const titleElement = element.querySelector(
      ".ytp-videowall-still-info-title"
    );
    const title = titleElement?.textContent?.trim() || "";

    const authorElement = element.querySelector(
      ".ytp-videowall-still-info-author"
    );
    const channel = authorElement?.textContent?.split("•")[0]?.trim() || "";

    const href = element.getAttribute("href") || "";
    const videoIdMatch = href.match(/(?:\/watch\?v=|youtu\.be\/)([^&?]+)/);
    const videoId = videoIdMatch?.[1] || "";

    if (!videoId) return null;

    return {
      videoId,
      title,
      channel,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    console.error(
      "[SolidButtonContainer] Error extracting end card video info:",
      error
    );
    return null;
  }
}

function extractVideoInfoFromMetadata(element: HTMLElement): VideoInfo | null {
  try {
    const metaDiv = element.closest("#meta");
    const titleAnchor = metaDiv?.querySelector(
      "a#video-title"
    ) as HTMLAnchorElement;

    if (!titleAnchor) return null;

    const title = titleAnchor.textContent?.trim() || "";
    const urlParams = new URLSearchParams(titleAnchor.search);
    const videoId = urlParams.get("v") || "";

    if (!videoId) return null;

    const channelElement =
      metaDiv?.querySelector(".yt-formatted-string") ??
      metaDiv?.querySelector(".ytd-channel-name");
    const channel = channelElement?.textContent?.trim() || "";

    return {
      videoId,
      title,
      channel,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    console.error(
      "[SolidButtonContainer] Error extracting metadata video info:",
      error
    );
    return null;
  }
}

function getVideoType(element: HTMLElement): ThumbnailData["type"] {
  const container = element.closest(
    "ytd-rich-grid-media, ytd-compact-video-renderer, ytd-video-renderer"
  );
  if (!container) return "regular";

  if (container.querySelector('[href*="/shorts/"], [aria-label*="Shorts"]')) {
    return "shorts";
  }

  if (container.querySelector('[aria-label*="LIVE"], [aria-label*="Live"]')) {
    return "live";
  }

  return "regular";
}

// Main initialization function
export const SolidInit = () => {
  console.log("[SolidInit] Starting Solid.js YouTube Extension...");

  // Create a single root container for our app
  const rootContainer = document.createElement("div");
  rootContainer.id = "solid-yt-summarize-root";
  rootContainer.style.display = "none"; // Hide the container itself
  document.body.appendChild(rootContainer);

  // Render the Solid app
  render(() => <SolidButtonContainer />, rootContainer);

  console.log("[SolidInit] Extension initialized successfully");
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", SolidInit);
} else {
  SolidInit();
}

export {};
