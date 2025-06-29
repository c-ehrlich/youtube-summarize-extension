/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import { cn } from "./utils/cn";
import buttonStyles from "./Button.module.css";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../ui-solid/primitives/dialog";
import { Button } from "../ui-solid/primitives/button";
import { LoadingSpinner } from "../ui-solid/loading-spinner";
import { useSummarizeData } from "./solid-data-hooks";
import { errorToString } from "../ui-solid/util/error-to-string";
import { SolidMarkdown } from "solid-markdown";
import { QueryClientProvider } from "@tanstack/solid-query";
import { solidQueryClient } from "./solid-query-provider";

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

type ButtonPortalInfo = VideoInfo & {
  thumbnailElement: Element;
};

const Loading = (props: { text: string }) => {
  return (
    <div class="flex flex-col gap-2 items-center justify-center text-gray-900 dark:text-gray-100">
      <LoadingSpinner size={32} />
      <div class="h-2" />
      <p>{props.text}</p>
    </div>
  );
};

const Content = (props: {
  videoId: string;
  title: string;
  channel: string;
}) => {
  const { videoInfoQuery, summaryQuery } = useSummarizeData({
    videoId: props.videoId,
    title: props.title,
    channel: props.channel,
  });

  return (
    <Show
      when={
        !videoInfoQuery.isLoading &&
        !summaryQuery.isLoading &&
        !videoInfoQuery.isError &&
        !summaryQuery.isError
      }
      fallback={
        <Show
          when={videoInfoQuery.isLoading}
          fallback={
            <Show
              when={summaryQuery.isLoading}
              fallback={
                <Show
                  when={videoInfoQuery.isError}
                  fallback={
                    <p>
                      Error loading summary: {errorToString(summaryQuery.error)}
                    </p>
                  }
                >
                  <p>
                    Error loading video info:{" "}
                    {errorToString(videoInfoQuery.error)}
                  </p>
                </Show>
              }
            >
              <Loading text="Loading summary..." />
            </Show>
          }
        >
          <Loading text="Loading video info..." />
        </Show>
      }
    >
      <DialogHeader class="pr-4 text-3xl">Summary</DialogHeader>
      <div class="w-full flex flex-col gap-2">
        <div class="prose prose-base max-w-none !text-xl dark:prose-invert [&>p]:mb-4">
          <SolidMarkdown children={summaryQuery.data?.summary || ""} />
        </div>
      </div>
      <DialogFooter class="flex gap-2">
        <Button variant="ghost" class="flex-1">
          <a href={`https://www.youtube.com/watch?v=${props.videoId}`}>Watch</a>
        </Button>
        <DialogClose>
          <Button variant="default" class="flex-1">
            Not interested
          </Button>
        </DialogClose>
      </DialogFooter>
    </Show>
  );
};

const SolidSummarizeButton = (props: ButtonPortalInfo) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const containerClasses = cn(buttonStyles.container, {
    [buttonStyles.absolute]: props.type !== "metadata",
    [buttonStyles.bottomLeft]:
      props.type !== "end-card" && props.type !== "metadata",
    [buttonStyles.bottomLeftZero]: props.type === "end-card",
    [buttonStyles.inlineBlock]: props.type === "metadata",
  });

  return (
    <div class={containerClasses}>
      <Dialog
        open={isOpen()}
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange called with:", open);
          setIsOpen(open);
        }}
      >
        <DialogTrigger
          class={cn(
            buttonStyles.button,
            "summarize-btn",
            "z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md",
            props.type !== "metadata" && "absolute"
          )}
          style={
            props.type === "metadata"
              ? {}
              : {
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                }
          }
          onPointerDown={(e: any) => {
            e.stopPropagation();
          }}
          onMouseDown={(e: any) => {
            e.stopPropagation();
          }}
        >
          Summarize
        </DialogTrigger>
        <DialogContent
          overlayClass="z-[9998]"
          class="bg-gray-100 dark:bg-gray-900 z-[9999] dark:text-white !max-w-2xl"
        >
          <Content
            videoId={props.videoId}
            title={props.title}
            channel={props.channel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SolidButtonPortal = (props: ButtonPortalInfo) => {
  let containerRef!: HTMLDivElement;

  onMount(() => {
    props.thumbnailElement.appendChild(containerRef);
    console.log(`[SolidYouTube] Injected button for: ${props.title}`);
  });

  onCleanup(() => {
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
            type: getVideoType(htmlElement),
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

      const anchor = container.querySelector(
        "a#thumbnail"
      ) as HTMLAnchorElement;
      if (!anchor) return null;

      const urlParams = new URLSearchParams(anchor.search || "");
      const videoId = urlParams.get("v") || "";

      if (!videoId) return null;

      return { videoId, title, channel };
    } catch (error) {
      console.error(
        "[SolidYouTube] Error extracting regular video info:",
        error
      );
      return null;
    }
  };

  const extractVideoInfoFromEndCard = (element: HTMLElement) => {
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

      return { videoId, title, channel };
    } catch (error) {
      console.error(
        "[SolidYouTube] Error extracting end card video info:",
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
    }, 500);
  };

  onMount(() => {
    console.log("[SolidYouTube] Initializing...");

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
      console.log("[SolidYouTube] Navigation detected");
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

  return (
    <For each={buttons()}>{(button) => <SolidButtonPortal {...button} />}</For>
  );
};

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
        <SolidButtonContainer />
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
