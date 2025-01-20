import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/primitives/popover";
import { cn } from "../ui/util/cn";

export function SummarizeButton({
  thumbnailElement,
}: {
  thumbnailElement: HTMLElement;
}) {
  // TODO: `useEffect` somehow makes things go bad here
  const videoId = (() => {
    const anchor = thumbnailElement.querySelector(
      "a#thumbnail"
    ) as HTMLAnchorElement;

    if (!anchor.search) {
      return null;
    }

    const urlParams = new URLSearchParams(anchor.search);
    return urlParams.get("v");
  })();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoId) {
      chrome.runtime.sendMessage({ type: "SUMMARIZE_VIDEO", videoId });
    } else {
      alert("No video ID found.");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "summarize-btn",
            "absolute z-50 bg-red-500 text-white border-none py-1 px-3 text-lg cursor-pointer rounded-md"
          )}
          onClick={handleClick}
          style={{
            bottom: "8px",
            left: "8px",
          }}
        >
          Summarize
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <Content />
      </PopoverContent>
    </Popover>
  );
}

const Content = () => {
  console.log("tktk foo");
  return <div className="p-4 bg-green-500">foo</div>;
};
