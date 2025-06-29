/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import { createSignal, createEffect, onCleanup, For, Show, Switch, Match } from "solid-js";
import { QueryClientProvider } from "@tanstack/solid-query";
import { useSummarizeData } from "./solid-data-hooks";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTrigger, 
  DialogClose 
} from "../ui-solid/primitives/dialog";
import { Button } from "../ui-solid/primitives/button";
import { LoadingSpinner } from "../ui-solid/loading-spinner";
import { solidQueryClient } from "./solid-query-provider";
import { SolidMarkdown } from "solid-markdown";

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
  const buttonStyles = () => 
    props.type === "metadata"
      ? {} // No special positioning for metadata
      : {
          position: "absolute" as const,
          bottom: "8px",
          left: "8px",
        };

  return (
    <Dialog>
      <DialogTrigger>
        <button
          class="summarize-btn z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md absolute"
          style={buttonStyles()}
        >
          Summarize
        </button>
      </DialogTrigger>
      <DialogContent
        overlayClass="z-[9998]"
        class="bg-gray-100 dark:bg-gray-900 z-[9999] dark:text-white !max-w-2xl"
      >
        <SummarizeContent videoId={props.videoId} title={props.title} channel={props.channel} />
      </DialogContent>
    </Dialog>
  );
};

const SummarizeContent = (props: { videoId: string; title: string; channel: string }) => {
  const { videoInfoQuery, summaryQuery } = useSummarizeData(props);

  return (
    <Switch>
      <Match when={videoInfoQuery.status === "pending"}>
        <Loading text="Loading video info..." />
      </Match>
      <Match when={summaryQuery.status === "pending"}>
        <Loading text="Loading summary..." />
      </Match>
      <Match when={videoInfoQuery.status === "error"}>
        <p>Error loading video info: {String(videoInfoQuery.error)}</p>
      </Match>
      <Match when={summaryQuery.status === "error"}>
        <p>Error loading summary: {String(summaryQuery.error)}</p>
      </Match>
      <Match when={summaryQuery.status === "success"}>
        <>
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
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </>
      </Match>
    </Switch>
  );
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

const SolidButtonPortal = (props: ButtonPortalInfo) => {
  const [portalContainer, setPortalContainer] = createSignal<HTMLDivElement | null>(null);

  createEffect(() => {
    // Create portal container
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; pointer-events: none; z-index: 50;';
    
    // Apply positioning based on type
    if (props.type === "metadata") {
      // For metadata buttons, we'll append to a suitable parent
      const parent = props.thumbnailElement.closest('.ytd-rich-metadata-row-renderer, .ytd-video-meta-block');
      if (parent) {
        parent.appendChild(container);
      } else {
        props.thumbnailElement.parentElement?.appendChild(container);
      }
    } else {
      // For regular thumbnails, append to the thumbnail element itself
      props.thumbnailElement.appendChild(container);
    }

    setPortalContainer(container);
  });

  onCleanup(() => {
    const container = portalContainer();
    if (container?.parentElement) {
      container.parentElement.removeChild(container);
    }
  });

  return (
    <Show when={portalContainer()}>
      {(container) => {
        render(() => (
          <div style="pointer-events: auto;">
            <SolidSummarizeButton {...props} />
          </div>
        ), container());
        return <></>;
      }}
    </Show>
  );
};

const SolidButtonContainer = () => {
  const [buttons, setButtons] = createSignal<ButtonPortalInfo[]>([]);

  // YouTube detection logic
  const detectYouTubeVideos = () => {
    const videoInfos: ButtonPortalInfo[] = [];
    
    // Regular video thumbnails
    const thumbnails = document.querySelectorAll(
      'a#thumbnail:not(.ytd-video-preview, .ytd-rich-grid-slim-media), ' +
      'a.ytd-thumbnail:not(.ytd-video-preview)'
    );
    
    thumbnails.forEach((thumbnail) => {
      if (thumbnail.querySelector('.summarize-btn')) return;
      
      const link = thumbnail as HTMLAnchorElement;
      const href = link.href;
      const videoIdMatch = href.match(/[?&]v=([^&]+)/);
      
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const titleElement = thumbnail.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer')
          ?.querySelector('#video-title, .ytd-video-meta-block #video-title, h3 a');
        const channelElement = thumbnail.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer')
          ?.querySelector('#channel-name a, .ytd-channel-name a, #text a');
        
        const title = titleElement?.textContent?.trim() || 'Unknown Video';
        const channel = channelElement?.textContent?.trim() || 'Unknown Channel';
        
        videoInfos.push({
          videoId,
          title,
          channel,
          type: "regular",
          thumbnailElement: thumbnail
        });
      }
    });

    // End card thumbnails
    const endCards = document.querySelectorAll('.ytp-ce-video-title-link, .ytp-ce-playlist-title-link');
    endCards.forEach((endCard) => {
      if (endCard.querySelector('.summarize-btn')) return;
      
      const link = endCard as HTMLAnchorElement;
      const href = link.href;
      const videoIdMatch = href.match(/[?&]v=([^&]+)/);
      
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const title = endCard.textContent?.trim() || 'Unknown Video';
        
        videoInfos.push({
          videoId,
          title,
          channel: 'Unknown Channel',
          type: "end-card",
          thumbnailElement: endCard
        });
      }
    });

    // Metadata detection (for current video)
    const metadataContainers = document.querySelectorAll('#above-the-fold, #meta, #primary-inner');
    metadataContainers.forEach((container) => {
      if (container.querySelector('.summarize-btn')) return;
      
      const urlMatch = window.location.href.match(/[?&]v=([^&]+)/);
      if (urlMatch) {
        const videoId = urlMatch[1];
        const titleElement = container.querySelector('#title h1, .ytd-video-primary-info-renderer h1');
        const channelElement = container.querySelector('#owner-container a, .ytd-channel-name a, #channel-name a');
        
        const title = titleElement?.textContent?.trim() || document.title.replace(' - YouTube', '');
        const channel = channelElement?.textContent?.trim() || 'Unknown Channel';
        
        videoInfos.push({
          videoId,
          title,
          channel,
          type: "metadata",
          thumbnailElement: container
        });
      }
    });

    return videoInfos;
  };

  // Periodic detection
  const checkForVideos = () => {
    const newButtons = detectYouTubeVideos();
    setButtons(newButtons);
  };

  // Set up observers and intervals
  createEffect(() => {
    checkForVideos();
    
    const interval = setInterval(checkForVideos, 1000);
    
    const observer = new MutationObserver(() => {
      setTimeout(checkForVideos, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Listen for navigation changes
    const handleNavigation = () => {
      setTimeout(checkForVideos, 500);
    };
    
    window.addEventListener('yt-navigate-finish', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    onCleanup(() => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('yt-navigate-finish', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    });
  });

  return (
    <For each={buttons()}>
      {(button) => <SolidButtonPortal {...button} />}
    </For>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={solidQueryClient}>
      <SolidButtonContainer />
    </QueryClientProvider>
  );
};

// Initialize the app
const init = () => {
  const container = document.createElement('div');
  container.id = 'solid-youtube-summarize-root';
  document.body.appendChild(container);
  
  render(() => <App />, container);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
