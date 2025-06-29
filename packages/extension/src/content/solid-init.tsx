/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import { createSignal, onMount, onCleanup, For } from "solid-js";

type VideoInfo = {
  videoId: string;
  title: string;
  channel: string;
  type: "regular" | "end-card" | "metadata" | "player" | "shorts" | "live" | "premiere";
};

type ButtonPortalInfo = VideoInfo & {
  thumbnailElement: Element;
};

const SolidSummarizeButton = (props: ButtonPortalInfo) => {
  const handleClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    // For now, show alert - we can implement actual summarization later
    alert(
      `Summarize: ${props.title}\nChannel: ${props.channel}\nVideo ID: ${props.videoId}`
    );
  };

  const containerStyles = () => {
    const base = {
      position: "absolute" as const,
      "z-index": "1001",
    };

    switch (props.type) {
      case "end-card":
        return { ...base, bottom: "0px", left: "0px" };
      case "metadata":
        return { display: "inline-block", "margin-left": "8px" };
      default:
        return { ...base, bottom: "8px", left: "8px" };
    }
  };

  const buttonStyles = {
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

  return (
    <div class="solid-summarize-container" style={containerStyles()}>
      <button
        class="summarize-btn solid-summarize-btn"
        style={buttonStyles}
        onClick={handleClick}
      >
        Summarize
      </button>
    </div>
  );
};



const SolidButtonPortal = (props: ButtonPortalInfo) => {
  let containerRef!: HTMLDivElement;

  onMount(() => {
    // Inject the container into the thumbnail element
    props.thumbnailElement.appendChild(containerRef);
    console.log(
      `[SolidYouTube] Injected button for: ${props.title}`
    );
  });

  onCleanup(() => {
    // Clean up when component is destroyed
    try {
      if (containerRef && containerRef.parentNode) {
        containerRef.parentNode.removeChild(containerRef);
      }
    } catch (error) {
      console.error("[SolidYouTube] Error cleaning up portal:", error);
    }
  });

  return (
    <div ref={containerRef}>
      <SolidSummarizeButton {...props} />
    </div>
  );
};

const SolidButtonContainer = () => {
  const [buttons, setButtons] = createSignal<ButtonPortalInfo[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);

  let debounceTimer: number | null = null;
  let mutationObserver: MutationObserver | null = null;
  const processed = new Set<HTMLElement>();

  // YouTube detection logic (enhanced from backup)
  const detectThumbnails = (): ButtonPortalInfo[] => {
    const found: ButtonPortalInfo[] = [];

    try {
      // Detect regular thumbnails
      const regularThumbnails = document.querySelectorAll("ytd-thumbnail");
      regularThumbnails.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;

        // Check if already has a button
        if (htmlElement.querySelector('.summarize-btn, .solid-summarize-container')) return;

        const videoInfo = extractVideoInfoFromRegular(htmlElement);
        if (videoInfo) {
          found.push({
            videoId: videoInfo.videoId,
            title: videoInfo.title,
            channel: videoInfo.channel,
            type: getVideoType(htmlElement),
            thumbnailElement: htmlElement
          });
          processed.add(htmlElement);
        }
      });

      // Detect end card thumbnails
      const endCardThumbnails = document.querySelectorAll(".ytp-videowall-still");
      endCardThumbnails.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;

        if (htmlElement.querySelector('.summarize-btn, .solid-summarize-container')) return;

        const videoInfo = extractVideoInfoFromEndCard(htmlElement);
        if (videoInfo) {
          found.push({
            videoId: videoInfo.videoId,
            title: videoInfo.title,
            channel: videoInfo.channel,
            type: "end-card",
            thumbnailElement: htmlElement
          });
          processed.add(htmlElement);
        }
      });
    } catch (error) {
      console.error("[SolidYouTube] Error detecting thumbnails:", error);
    }

    return found;
  };

  const extractVideoInfoFromRegular = (element: HTMLElement) => {
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

      return { videoId, title, channel };
    } catch (error) {
      console.error("[SolidYouTube] Error extracting regular video info:", error);
      return null;
    }
  };

  const extractVideoInfoFromEndCard = (element: HTMLElement) => {
    try {
      const titleElement = element.querySelector(".ytp-videowall-still-info-title");
      const title = titleElement?.textContent?.trim() || "";

      const authorElement = element.querySelector(".ytp-videowall-still-info-author");
      const channel = authorElement?.textContent?.split("•")[0]?.trim() || "";

      const href = element.getAttribute("href") || "";
      const videoIdMatch = href.match(/(?:\/watch\?v=|youtu\.be\/)([^&?]+)/);
      const videoId = videoIdMatch?.[1] || "";

      if (!videoId) return null;

      return { videoId, title, channel };
    } catch (error) {
      console.error("[SolidYouTube] Error extracting end card video info:", error);
      return null;
    }
  };

  const getVideoType = (element: HTMLElement): ButtonPortalInfo["type"] => {
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
  };

  const processPage = () => {
    if (isProcessing()) return;
    setIsProcessing(true);

    try {
      console.log("[SolidYouTube] Processing page...");
      const detected = detectThumbnails();

      if (detected.length > 0) {
        console.log(`[SolidYouTube] Found ${detected.length} new thumbnails`);
        setButtons((prev) => [...prev, ...detected]);
      }
    } catch (error) {
      console.error("[SolidYouTube] Error processing page:", error);
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
    console.log("[SolidYouTube] Initializing...");

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
      console.log("[SolidYouTube] Navigation detected");
      // Clear existing thumbnails on navigation
      setButtons([]);
      processed.clear();
      setTimeout(() => processPage(), 1000);
    };

    window.addEventListener("yt-navigate-finish", handleNavigation);

    onCleanup(() => {
      console.log("[SolidYouTube] Cleaning up...");
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.removeEventListener("yt-navigate-finish", handleNavigation);
    });
  });

  console.log("[SolidButtonContainer] Rendering with buttons:", buttons().length);

  return (
    <For each={buttons()}>
      {(button) => <SolidButtonPortal {...button} />}
    </For>
  );
};

// Initialize the app
const init = () => {
  const container = document.createElement('div');
  container.id = 'solid-youtube-summarize-root';
  container.style.display = 'none'; // Hide the container itself
  document.body.appendChild(container);
  
  render(() => <SolidButtonContainer />, container);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
