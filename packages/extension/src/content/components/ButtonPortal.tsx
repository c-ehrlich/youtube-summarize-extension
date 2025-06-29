/** @jsxImportSource solid-js */
import { onMount, onCleanup } from "solid-js";
import { SummarizeButton, type ButtonPortalInfo } from "./SummarizeButton";

export const ButtonPortal = (props: ButtonPortalInfo) => {
  let containerRef!: HTMLDivElement;

  onMount(() => {
    props.thumbnailElement.appendChild(containerRef);
    console.log(`[yt-summarize] Injected button for: ${props.title}`);
  });

  onCleanup(() => {
    try {
      if (containerRef && containerRef.parentNode) {
        containerRef.parentNode.removeChild(containerRef);
      }
    } catch (error) {
      console.error("[yt-summarize] Error cleaning up portal:", error);
    }
  });

  return (
    <div ref={containerRef}>
      <SummarizeButton {...props} />
    </div>
  );
};
