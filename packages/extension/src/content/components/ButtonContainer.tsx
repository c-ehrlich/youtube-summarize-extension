/** @jsxImportSource solid-js */
import { createSignal, onMount, onCleanup, For } from "solid-js";
import { ButtonPortal } from "./ButtonPortal";
import type { ButtonPortalInfo } from "./SummarizeButton";

type VideoInfo = {
  videoId: string;
  title: string;
  channel: string;
  type:
    | "regular"
    | "end-card"
    | "metadata"
    | "player"
    | "shorts"
    | "live"
    | "premiere";
};

export const ButtonContainer = () => {
  const [buttons, setButtons] = createSignal<ButtonPortalInfo[]>([]);
  const [isProcessing, setIsProcessing] = createSignal(false);

  let debounceTimer: number | null = null;
  let mutationObserver: MutationObserver | null = null;
  const processed = new Set<HTMLElement>();

  const detectThumbnails = (): ButtonPortalInfo[] => {
    const found: ButtonPortalInfo[] = [];

    try {
      // Detect regular thumbnails
      const regularThumbnails = document.querySelectorAll("ytd-thumbnail");
      regularThumbnails.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;

        // Check if already has a button
        if (htmlElement.querySelector(".summarize-btn")) return;

        const videoInfo = extractVideoInfoFromRegular(htmlElement);
        if (videoInfo) {
          found.push({
            videoId: videoInfo.videoId,
            title: videoInfo.title,
            channel: videoInfo.channel,
            type: videoInfo.type,
            thumbnailElement: htmlElement,
          });
          processed.add(htmlElement);
        }
      });

      // Detect end card thumbnails
      const endCardThumbnails = document.querySelectorAll(
        ".ytp-videowall-still"
      );
      endCardThumbnails.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (processed.has(htmlElement)) return;
        if (htmlElement.querySelector(".summarize-btn")) return;

        const videoInfo = extractVideoInfoFromEndCard(htmlElement);
        if (videoInfo) {
          found.push({
            videoId: videoInfo.videoId,
            title: videoInfo.title,
            channel: videoInfo.channel,
            type: "end-card",
            thumbnailElement: htmlElement,
          });
          processed.add(htmlElement);
        }
      });
    } catch (error) {
      console.error("[yt-summarize] Error detecting thumbnails:", error);
    }

    return found;
  };

  const extractVideoInfoFromRegular = (
    element: HTMLElement
  ): VideoInfo | null => {
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

      const anchor = container.querySelector(
        "a#thumbnail"
      ) as HTMLAnchorElement;
      if (!anchor) return null;

      const urlParams = new URLSearchParams(anchor.search || "");
      const videoId = urlParams.get("v") || "";

      if (!videoId) return null;

      const type = getVideoType(element);

      return { videoId, title, channel, type };
    } catch (error) {
      console.error(
        "[yt-summarize] Error extracting regular video info:",
        error
      );
      return null;
    }
  };

  const extractVideoInfoFromEndCard = (
    element: HTMLElement
  ): VideoInfo | null => {
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

      return { videoId, title, channel, type: "end-card" };
    } catch (error) {
      console.error(
        "[yt-summarize] Error extracting end card video info:",
        error
      );
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
      console.log("[yt-summarize] Processing page...");
      const detected = detectThumbnails();

      if (detected.length > 0) {
        console.log(`[yt-summarize] Found ${detected.length} new thumbnails`);
        setButtons((prev) => [...prev, ...detected]);
      }
    } catch (error) {
      console.error("[yt-summarize] Error processing page:", error);
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
    }, 500);
  };

  onMount(() => {
    console.log("[yt-summarize] Initializing...");

    setTimeout(() => {
      processPage();
    }, 1000);

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

    const handleNavigation = () => {
      console.log("[yt-summarize] Navigation detected");
      setButtons([]);
      processed.clear();
      setTimeout(() => processPage(), 1000);
    };

    window.addEventListener("yt-navigate-finish", handleNavigation);

    onCleanup(() => {
      console.log("[yt-summarize] Cleaning up...");
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.removeEventListener("yt-navigate-finish", handleNavigation);
    });
  });

  return <For each={buttons()}>{(button) => <ButtonPortal {...button} />}</For>;
};
